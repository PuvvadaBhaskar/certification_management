export const generatePDF = (certifications, fileName = "certifications.csv") => {
  let csvContent =
    "Name,Organization,Issue Date,Expiry Date,Status\n";

  certifications.forEach((cert) => {
    const isExpired = new Date(cert.expiryDate) <= new Date();
    const status = isExpired ? "Expired" : "Active";
    csvContent += `"${cert.name}","${cert.organization}","${cert.issueDate}","${cert.expiryDate}","${status}"\n`;
  });

  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export const exportToJSON = (data, fileName = "data.json") => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: "application/json" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};
