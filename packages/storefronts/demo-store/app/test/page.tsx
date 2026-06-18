'use client'

export default function TestPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL
  const storeId = process.env.NEXT_PUBLIC_STORE_ID

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Test</h1>
      <div className="space-y-2">
        <p><strong>API URL:</strong> {apiUrl || 'NOT SET'}</p>
        <p><strong>Store ID:</strong> {storeId || 'NOT SET'}</p>
        <p><strong>Full URL:</strong> {apiUrl}/stores/{storeId}/products</p>
      </div>
    </div>
  )
}
