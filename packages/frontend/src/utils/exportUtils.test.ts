import { ExportUtils } from './exportUtils'
import { mockAnalyticsData } from '@/test-utils'
import type { ExportOptions } from '@/types/analytics'

// Mock jsPDF and XLSX
jest.mock('jspdf', () => {
  const mockDoc = {
    setFontSize: jest.fn(),
    text: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    lastAutoTable: { finalY: 100 }
  }
  return jest.fn(() => mockDoc)
})

jest.mock('jspdf-autotable', () => jest.fn())

jest.mock('xlsx', () => ({
  utils: {
    book_new: jest.fn(() => ({})),
    aoa_to_sheet: jest.fn(() => ({})),
    book_append_sheet: jest.fn(),
  },
  writeFile: jest.fn(),
}))

// Mock DOM methods
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: jest.fn(() => 'mock-url'),
    revokeObjectURL: jest.fn(),
  },
})

describe('ExportUtils', () => {
  const mockExportOptions: ExportOptions = {
    format: 'csv',
    dateRange: mockAnalyticsData.period,
    metrics: ['revenue', 'orders', 'products', 'stores']
  }

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock DOM methods
    document.createElement = jest.fn(() => ({
      href: '',
      download: '',
      click: jest.fn(),
      style: { visibility: '' }
    })) as any
    
    document.body.appendChild = jest.fn()
    document.body.removeChild = jest.fn()
  })

  describe('exportToCSV', () => {
    it('generates CSV content correctly', () => {
      const createElementSpy = jest.spyOn(document, 'createElement')
      const mockLink = {
        setAttribute: jest.fn(),
        click: jest.fn(),
        style: { visibility: '' }
      }
      createElementSpy.mockReturnValue(mockLink as any)

      ExportUtils.exportToCSV(mockAnalyticsData, mockExportOptions)

      expect(createElementSpy).toHaveBeenCalledWith('a')
      expect(mockLink.setAttribute).toHaveBeenCalledWith('href', expect.any(String))
      expect(mockLink.setAttribute).toHaveBeenCalledWith('download', expect.stringContaining('.csv'))
      expect(mockLink.click).toHaveBeenCalled()
    })

    it('includes revenue metrics when specified', () => {
      const optionsWithRevenue = { ...mockExportOptions, metrics: ['revenue'] }
      
      // Spy on arrayToCSV to check the generated content
      const arrayToCSVSpy = jest.spyOn(ExportUtils as any, 'arrayToCSV')
      
      ExportUtils.exportToCSV(mockAnalyticsData, optionsWithRevenue)
      
      // Check that revenue data is included
      expect(arrayToCSVSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.arrayContaining(['REVENUE METRICS'])
        ])
      )
    })

    it('includes orders metrics when specified', () => {
      const optionsWithOrders = { ...mockExportOptions, metrics: ['orders'] }
      
      const arrayToCSVSpy = jest.spyOn(ExportUtils as any, 'arrayToCSV')
      
      ExportUtils.exportToCSV(mockAnalyticsData, optionsWithOrders)
      
      expect(arrayToCSVSpy).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.arrayContaining(['ORDER METRICS'])
        ])
      )
    })
  })

  describe('exportToExcel', () => {
    it('creates workbook with multiple sheets', () => {
      const XLSX = require('xlsx')
      
      ExportUtils.exportToExcel(mockAnalyticsData, mockExportOptions)
      
      expect(XLSX.utils.book_new).toHaveBeenCalled()
      expect(XLSX.utils.aoa_to_sheet).toHaveBeenCalledTimes(5) // Summary + 4 metric sheets
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledTimes(5)
      expect(XLSX.writeFile).toHaveBeenCalled()
    })

    it('creates summary sheet', () => {
      const XLSX = require('xlsx')
      
      ExportUtils.exportToExcel(mockAnalyticsData, mockExportOptions)
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Summary'
      )
    })

    it('creates revenue sheet when revenue metrics included', () => {
      const XLSX = require('xlsx')
      const optionsWithRevenue = { ...mockExportOptions, metrics: ['revenue'] }
      
      ExportUtils.exportToExcel(mockAnalyticsData, optionsWithRevenue)
      
      expect(XLSX.utils.book_append_sheet).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        'Revenue'
      )
    })
  })

  describe('exportToPDF', () => {
    it('creates PDF document with title and date range', () => {
      const jsPDF = require('jspdf')
      const mockDoc = new jsPDF()
      
      ExportUtils.exportToPDF(mockAnalyticsData, mockExportOptions)
      
      expect(mockDoc.setFontSize).toHaveBeenCalledWith(20)
      expect(mockDoc.text).toHaveBeenCalledWith('Analytics Report', 20, 20)
      expect(mockDoc.save).toHaveBeenCalled()
    })

    it('includes revenue summary when revenue metrics specified', () => {
      const jsPDF = require('jspdf')
      const autoTable = require('jspdf-autotable')
      const optionsWithRevenue = { ...mockExportOptions, metrics: ['revenue'] }
      
      ExportUtils.exportToPDF(mockAnalyticsData, optionsWithRevenue)
      
      expect(autoTable).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          head: [['Metric', 'Value']],
          body: expect.arrayContaining([
            ['Total Revenue', '$125,431']
          ])
        })
      )
    })
  })

  describe('generateFilename', () => {
    it('generates filename with correct format and date', () => {
      const filename = (ExportUtils as any).generateFilename('csv', mockExportOptions)
      
      expect(filename).toMatch(/analytics_.*\.csv$/)
      expect(filename).toContain('2024')
    })

    it('includes period information in filename', () => {
      const filename = (ExportUtils as any).generateFilename('pdf', mockExportOptions)
      
      expect(filename).toContain('Jan')
      expect(filename).toMatch(/\.pdf$/)
    })
  })

  describe('arrayToCSV', () => {
    it('converts array to CSV format correctly', () => {
      const testData = [
        ['Name', 'Value'],
        ['Test', 123],
        ['Another', 'with,comma']
      ]
      
      const csv = (ExportUtils as any).arrayToCSV(testData)
      
      expect(csv).toContain('Name,Value')
      expect(csv).toContain('Test,123')
      expect(csv).toContain('"with,comma"') // Should quote strings with commas
    })

    it('handles strings with quotes correctly', () => {
      const testData = [
        ['Text with "quotes"', 'Normal text']
      ]
      
      const csv = (ExportUtils as any).arrayToCSV(testData)
      
      expect(csv).toContain('""quotes""') // Should escape quotes
    })
  })
})
