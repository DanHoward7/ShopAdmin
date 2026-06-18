import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'
import { format } from 'date-fns'
import type { AnalyticsDashboard, ExportOptions } from '@/types/analytics'

export class ExportUtils {
  // Export to CSV
  static exportToCSV(data: AnalyticsDashboard, options: ExportOptions): void {
    const csvData = this.prepareCSVData(data, options)
    const csvContent = this.arrayToCSV(csvData)
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', this.generateFilename('csv', options))
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  // Export to Excel
  static exportToExcel(data: AnalyticsDashboard, options: ExportOptions): void {
    const workbook = XLSX.utils.book_new()
    
    // Summary sheet
    const summaryData = this.prepareSummaryData(data)
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')
    
    // Revenue data sheet
    if (options.metrics.includes('revenue')) {
      const revenueData = this.prepareRevenueData(data)
      const revenueSheet = XLSX.utils.aoa_to_sheet(revenueData)
      XLSX.utils.book_append_sheet(workbook, revenueSheet, 'Revenue')
    }
    
    // Orders data sheet
    if (options.metrics.includes('orders')) {
      const ordersData = this.prepareOrdersData(data)
      const ordersSheet = XLSX.utils.aoa_to_sheet(ordersData)
      XLSX.utils.book_append_sheet(workbook, ordersSheet, 'Orders')
    }
    
    // Products data sheet
    if (options.metrics.includes('products')) {
      const productsData = this.prepareProductsData(data)
      const productsSheet = XLSX.utils.aoa_to_sheet(productsData)
      XLSX.utils.book_append_sheet(workbook, productsSheet, 'Products')
    }
    
    // Store performance sheet
    if (options.metrics.includes('stores')) {
      const storesData = this.prepareStoresData(data)
      const storesSheet = XLSX.utils.aoa_to_sheet(storesData)
      XLSX.utils.book_append_sheet(workbook, storesSheet, 'Stores')
    }
    
    XLSX.writeFile(workbook, this.generateFilename('xlsx', options))
  }

  // Export to PDF
  static exportToPDF(data: AnalyticsDashboard, options: ExportOptions): void {
    const doc = new jsPDF()
    let yPosition = 20
    
    // Title
    doc.setFontSize(20)
    doc.text('Analytics Report', 20, yPosition)
    yPosition += 10
    
    // Date range
    doc.setFontSize(12)
    doc.text(
      `Period: ${format(options.dateRange.start, 'MMM dd, yyyy')} - ${format(options.dateRange.end, 'MMM dd, yyyy')}`,
      20,
      yPosition
    )
    yPosition += 20
    
    // Summary metrics
    if (options.metrics.includes('revenue')) {
      doc.setFontSize(16)
      doc.text('Revenue Summary', 20, yPosition)
      yPosition += 10
      
      const revenueTable = [
        ['Metric', 'Value'],
        ['Total Revenue', `$${data.revenue.totalRevenue.toLocaleString()}`],
        ['Previous Revenue', `$${data.revenue.previousRevenue.toLocaleString()}`],
        ['Growth', `${data.revenue.revenueGrowth.toFixed(1)}%`],
        ['Average Order Value', `$${data.revenue.averageOrderValue.toFixed(2)}`],
        ['Conversion Rate', `${data.revenue.conversionRate.toFixed(1)}%`],
      ]
      
      autoTable(doc, {
        head: [revenueTable[0]],
        body: revenueTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [49, 130, 206] },
      })
      
      yPosition = (doc as any).lastAutoTable.finalY + 20
    }
    
    // Orders summary
    if (options.metrics.includes('orders')) {
      doc.setFontSize(16)
      doc.text('Orders Summary', 20, yPosition)
      yPosition += 10
      
      const ordersTable = [
        ['Status', 'Count', 'Percentage'],
        ...data.orders.ordersByStatus.map(status => [
          status.status.charAt(0).toUpperCase() + status.status.slice(1),
          status.count.toString(),
          `${status.percentage.toFixed(1)}%`
        ])
      ]
      
      autoTable(doc, {
        head: [ordersTable[0]],
        body: ordersTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [56, 161, 105] },
      })
      
      yPosition = (doc as any).lastAutoTable.finalY + 20
    }
    
    // Top products
    if (options.metrics.includes('products')) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(16)
      doc.text('Top Products', 20, yPosition)
      yPosition += 10
      
      const productsTable = [
        ['Product', 'Sales', 'Revenue'],
        ...data.products.topSellingProducts.map(product => [
          product.name,
          product.sales.toString(),
          `$${product.revenue.toLocaleString()}`
        ])
      ]
      
      autoTable(doc, {
        head: [productsTable[0]],
        body: productsTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [159, 122, 234] },
      })
      
      yPosition = (doc as any).lastAutoTable.finalY + 20
    }
    
    // Store performance
    if (options.metrics.includes('stores')) {
      if (yPosition > 250) {
        doc.addPage()
        yPosition = 20
      }
      
      doc.setFontSize(16)
      doc.text('Store Performance', 20, yPosition)
      yPosition += 10
      
      const storesTable = [
        ['Store', 'Orders', 'Revenue', 'Growth'],
        ...data.stores.storePerformance.map(store => [
          store.storeName,
          store.orders.toString(),
          `$${store.revenue.toLocaleString()}`,
          `${store.growth.toFixed(1)}%`
        ])
      ]
      
      autoTable(doc, {
        head: [storesTable[0]],
        body: storesTable.slice(1),
        startY: yPosition,
        theme: 'grid',
        headStyles: { fillColor: [237, 137, 54] },
      })
    }
    
    doc.save(this.generateFilename('pdf', options))
  }

  // Helper methods
  private static prepareCSVData(data: AnalyticsDashboard, options: ExportOptions): any[][] {
    const csvData: any[][] = []
    
    // Header
    csvData.push(['Analytics Report'])
    csvData.push([`Period: ${format(options.dateRange.start, 'MMM dd, yyyy')} - ${format(options.dateRange.end, 'MMM dd, yyyy')}`])
    csvData.push([]) // Empty row
    
    // Revenue data
    if (options.metrics.includes('revenue')) {
      csvData.push(['REVENUE METRICS'])
      csvData.push(['Total Revenue', data.revenue.totalRevenue])
      csvData.push(['Previous Revenue', data.revenue.previousRevenue])
      csvData.push(['Growth %', data.revenue.revenueGrowth])
      csvData.push(['Average Order Value', data.revenue.averageOrderValue])
      csvData.push(['Conversion Rate %', data.revenue.conversionRate])
      csvData.push([]) // Empty row
    }
    
    // Orders data
    if (options.metrics.includes('orders')) {
      csvData.push(['ORDER METRICS'])
      csvData.push(['Status', 'Count', 'Percentage'])
      data.orders.ordersByStatus.forEach(status => {
        csvData.push([status.status, status.count, status.percentage])
      })
      csvData.push([]) // Empty row
    }
    
    return csvData
  }

  private static arrayToCSV(data: any[][]): string {
    return data.map(row => 
      row.map(cell => {
        if (typeof cell === 'string' && (cell.includes(',') || cell.includes('"') || cell.includes('\n'))) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(',')
    ).join('\n')
  }

  private static prepareSummaryData(data: AnalyticsDashboard): any[][] {
    return [
      ['Metric', 'Value'],
      ['Total Revenue', data.revenue.totalRevenue],
      ['Total Orders', data.orders.totalOrders],
      ['Average Order Value', data.revenue.averageOrderValue],
      ['Conversion Rate', data.revenue.conversionRate],
      ['Total Products', data.products.totalProducts],
      ['Total Stores', data.stores.totalStores],
      ['Total Customers', data.customers.totalCustomers],
    ]
  }

  private static prepareRevenueData(data: AnalyticsDashboard): any[][] {
    const header = ['Date', 'Revenue']
    const rows = data.charts.revenueOverTime[0]?.data.map(point => [
      point.date,
      point.value
    ]) || []
    
    return [header, ...rows]
  }

  private static prepareOrdersData(data: AnalyticsDashboard): any[][] {
    const header = ['Date', 'Orders']
    const rows = data.charts.ordersOverTime[0]?.data.map(point => [
      point.date,
      point.value
    ]) || []
    
    return [header, ...rows]
  }

  private static prepareProductsData(data: AnalyticsDashboard): any[][] {
    const header = ['Product', 'Sales', 'Revenue']
    const rows = data.products.topSellingProducts.map(product => [
      product.name,
      product.sales,
      product.revenue
    ])
    
    return [header, ...rows]
  }

  private static prepareStoresData(data: AnalyticsDashboard): any[][] {
    const header = ['Store', 'Orders', 'Revenue', 'Growth %']
    const rows = data.stores.storePerformance.map(store => [
      store.storeName,
      store.orders,
      store.revenue,
      store.growth
    ])
    
    return [header, ...rows]
  }

  private static generateFilename(extension: string, options: ExportOptions): string {
    const dateStr = format(new Date(), 'yyyy-MM-dd')
    const periodStr = `${format(options.dateRange.start, 'MMM-dd')}_to_${format(options.dateRange.end, 'MMM-dd')}`
    return `analytics_${periodStr}_${dateStr}.${extension}`
  }
}
