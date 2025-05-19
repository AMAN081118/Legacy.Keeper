export function exportToCSV(data: any[], filename = "export.csv") {
  // Determine the type of data and set appropriate headers
  let headers: string[] = []

  if (data.length > 0) {
    if ("transaction_type" in data[0]) {
      // This is a transaction
      headers = ["ID", "Name", "Amount", "Transaction Type", "Payment Mode", "Date", "Created At"]
    } else if ("status" in data[0]) {
      // This is a request
      headers = [
        "ID",
        "Title",
        "Email",
        "Amount",
        "Comment",
        "Status",
        "Date",
        "User Name",
        "Transaction Type",
        "Details",
      ]
    } else {
      // Generic fallback - use object keys as headers
      headers = Object.keys(data[0])
    }
  }

  // Format the data
  const csvRows = [
    // Add the headers
    headers.join(","),
    // Add the data rows
    ...data.map((item) => {
      if ("transaction_type" in item) {
        // Format transaction data
        return [
          item.id,
          `"${item.name.replace(/"/g, '""')}"`, // Escape quotes in name
          item.amount,
          item.transaction_type,
          `"${(item.payment_mode || "N/A").replace(/"/g, '""')}"`,
          item.date,
          item.created_at,
        ].join(",")
      } else if ("status" in item) {
        // Format request data
        return [
          item.id,
          `"${item.title.replace(/"/g, '""')}"`, // Escape quotes in title
          `"${item.email.replace(/"/g, '""')}"`,
          item.amount,
          `"${(item.comment || "N/A").replace(/"/g, '""')}"`,
          item.status,
          item.date || item.created_at,
          `"${(item.userName || item.sender?.name || "User").replace(/"/g, '""')}"`,
          item.transaction_type || "N/A",
          `"${(item.details || "N/A").replace(/"/g, '""')}"`,
        ].join(",")
      } else {
        // Generic fallback
        return headers
          .map((header) => {
            const value = item[header]
            return typeof value === "string" ? `"${value.replace(/"/g, '""')}"` : value
          })
          .join(",")
      }
    }),
  ].join("\n")

  // Create a Blob with the CSV data
  const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" })

  // Create a download link
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.setAttribute("href", url)
  link.setAttribute("download", filename)
  link.style.visibility = "hidden"

  // Append to the document, click it, and remove it
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
