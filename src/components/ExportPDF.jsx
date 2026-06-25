import { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader, FileText } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ExportPDF = () => {
  const navigate = useNavigate();
  const [exporting, setExporting] = useState(false);

  // const exportAllData = async () => {
  //   setExporting(true);
  //   try {
  //     // Fetch all data
  //     const [
  //       vehiclesRes,
  //       ordersRes,
  //       enquiriesRes,
  //       tripsRes,
  //       maintenanceRes,
  //       profileRes,
  //     ] = await Promise.all([
  //       supabase.from("vehicles").select("*").order("id"),
  //       supabase.from("orders").select("*").order("id"),
  //       supabase.from("enquiries").select("*").order("id"),
  //       supabase.from("trips").select("*").order("id"),
  //       supabase.from("vehicle_maintenance").select("*").order("id"),
  //       supabase.from("profile").select("*").order("id"),
  //     ]);

  //     const vehicles = vehiclesRes.data || [];
  //     const orders = ordersRes.data || [];
  //     const enquiries = enquiriesRes.data || [];
  //     const trips = tripsRes.data || [];
  //     const maintenance = maintenanceRes.data || [];
  //     const profiles = profileRes.data || [];

  //     // Create PDF
  //     const doc = new jsPDF("landscape", "mm", "a4");
  //     const pageWidth = doc.internal.pageSize.width;
  //     const pageHeight = doc.internal.pageSize.height;

  //     // Helper function to clean text
  //     const cleanText = (text) => {
  //       if (!text) return "-";
  //       return String(text).trim();
  //     };

  //     // Helper function to add section
  //     const addSection = (title, data, columns, columnStyles = {}) => {
  //       if (data.length === 0) {
  //         const yPos = doc.lastAutoTable?.finalY + 15 || 50;
  //         doc.setFontSize(10);
  //         doc.setTextColor(150);
  //         doc.text(`No ${title} found`, 14, yPos);
  //         return;
  //       }

  //       // Add section title
  //       const yPos = doc.lastAutoTable?.finalY + 15 || 45;
        
  //       // Check if we need a new page
  //       if (yPos > pageHeight - 30) {
  //         doc.addPage();
  //         doc.lastAutoTable = { finalY: 20 };
  //       }
        
  //       doc.setFontSize(14);
  //       doc.setTextColor(41, 128, 185);
  //       doc.text(title, 14, yPos);

  //       doc.setFontSize(9);
  //       doc.setTextColor(100);
  //       doc.text(`Total: ${data.length} records`, 14, yPos + 6);

  //       // Prepare data for table with proper formatting
  //       const tableData = data.map((row) => {
  //         return columns.map((col) => {
  //           const key = col.toLowerCase().replace(/ /g, "_");
  //           let value = row[key];

  //           // Handle different data types
  //           if (value === null || value === undefined) {
  //             return "-";
  //           }

  //           // Format dates
  //           if (
  //             [
  //               "created_at",
  //               "updated_at",
  //               "service_date",
  //               "from_date",
  //               "to_date",
  //             ].includes(key)
  //           ) {
  //             if (value) {
  //               const date = new Date(value);
  //               if (!isNaN(date)) {
  //                 return date.toLocaleDateString("en-IN", {
  //                   day: "2-digit",
  //                   month: "short",
  //                   year: "numeric",
  //                 });
  //               }
  //             }
  //             return "-";
  //           }

  //           // Format currency
  //           if (
  //             [
  //               "total_amount",
  //               "advance",
  //               "balance",
  //               "cost",
  //               "fuel_expense",
  //               "toll_expense",
  //               "driver_salary",
  //               "other_expense",
  //               "net_profit",
  //             ].includes(key)
  //           ) {
  //             const num = Number(value);
  //             if (!isNaN(num) && num !== 0) {
  //               return `₹${num.toLocaleString("en-IN")}`;
  //             }
  //             return "₹0";
  //           }

  //           // Format time
  //           if (["from_time", "to_time"].includes(key)) {
  //             if (value) {
  //               const [hours, minutes] = value.split(':');
  //               const hour = parseInt(hours);
  //               const ampm = hour >= 12 ? 'PM' : 'AM';
  //               const hour12 = hour % 12 || 12;
  //               return `${hour12}:${minutes} ${ampm}`;
  //             }
  //             return "-";
  //           }

  //           return cleanText(value);
  //         });
  //       });

  //       // Add table
  //       autoTable(doc, {
  //         startY: yPos + 10,
  //         head: [columns],
  //         body: tableData,
  //         theme: "striped",
  //         headStyles: {
  //           fillColor: [41, 128, 185],
  //           textColor: [255, 255, 255],
  //           fontSize: 6,
  //           fontStyle: "bold",
  //           halign: "center",
  //         },
  //         styles: {
  //           fontSize: 5,
  //           cellPadding: 1,
  //           valign: "middle",
  //           overflow: 'linebreak',
  //         },
  //         columnStyles: columnStyles,
  //         margin: { left: 10, right: 10 },
  //         didDrawPage: function (data) {
  //           // Footer
  //           const pageCount = doc.internal.getNumberOfPages();
  //           const currentPage = doc.internal.getCurrentPageInfo().pageNumber;
  //           doc.setFontSize(6);
  //           doc.setTextColor(150);
  //           doc.text(
  //             `Page ${currentPage} of ${pageCount}`,
  //             pageWidth - 15,
  //             pageHeight - 8,
  //           );
  //           doc.text("NJV Travels - Complete Data Export", 10, pageHeight - 8);
  //         },
  //       });
  //     };

  //     // --- TITLE PAGE ---
  //     doc.setFontSize(24);
  //     doc.setTextColor(0);
  //     doc.text("NJV Travels", pageWidth / 2, 40, { align: "center" });

  //     doc.setFontSize(18);
  //     doc.setTextColor(41, 128, 185);
  //     doc.text("Complete Data Export Report", pageWidth / 2, 55, { align: "center" });

  //     doc.setFontSize(11);
  //     doc.setTextColor(100);
  //     doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, 68, {
  //       align: "center",
  //     });

  //     // Total records
  //     const totalRecords =
  //       vehicles.length +
  //       orders.length +
  //       enquiries.length +
  //       trips.length +
  //       maintenance.length +
  //       profiles.length;

  //     doc.setFontSize(14);
  //     doc.setTextColor(0);
  //     doc.text(`Total Records: ${totalRecords}`, pageWidth / 2, 85, {
  //       align: "center",
  //     });

  //     // Separator line
  //     doc.line(20, 100, pageWidth - 20, 100);

  //     // Export summary
  //     doc.setFontSize(11);
  //     doc.setTextColor(60);
  //     const summaryY = 115;
  //     const summaryItems = [
  //       { label: "Vehicles", value: vehicles.length },
  //       { label: "Orders", value: orders.length },
  //       { label: "Enquiries", value: enquiries.length },
  //       { label: "Trips", value: trips.length },
  //       { label: "Maintenance", value: maintenance.length },
  //       { label: "Profiles", value: profiles.length },
  //     ];

  //     summaryItems.forEach((item, index) => {
  //       const xPos = 30 + (index % 3) * 80;
  //       const yOffset = Math.floor(index / 3) * 15;
  //       doc.setFontSize(10);
  //       doc.setTextColor(80);
  //       doc.text(`${item.label}:`, xPos, summaryY + yOffset);
  //       doc.setFontSize(12);
  //       doc.setTextColor(0);
  //       doc.text(String(item.value), xPos + 35, summaryY + yOffset);
  //     });

  //     doc.line(20, 170, pageWidth - 20, 170);
  //     doc.setFontSize(8);
  //     doc.setTextColor(150);
  //     doc.text(
  //       "This report contains all data from the NJV Travels fleet management system.",
  //       pageWidth / 2,
  //       180,
  //       { align: "center" },
  //     );

  //     // Reset position for data sections
  //     doc.lastAutoTable = { finalY: 195 };

  //     // 1. VEHICLES
  //     addSection(
  //       "VEHICLES",
  //       vehicles,
  //       ["ID", "Vehicle Name", "Vehicle Number", "Odometer (KM)", "Created At"],
  //       {
  //         0: { cellWidth: 12, halign: "center" },
  //         1: { cellWidth: 45 },
  //         2: { cellWidth: 35 },
  //         3: { cellWidth: 25, halign: "right" },
  //         4: { cellWidth: 35, halign: "center" },
  //       },
  //     );

  //     // 2. ORDERS
  //     addSection(
  //       "ORDERS",
  //       orders,
  //       [
  //         "ID",
  //         "Customer",
  //         "Mobile",
  //         "Vehicle",
  //         "Driver",
  //         "From",
  //         "To",
  //         "From Date",
  //         "To Date",
  //         "Total",
  //         "Advance",
  //         "Balance",
  //       ],
  //       {
  //         0: { cellWidth: 10, halign: "center" },
  //         1: { cellWidth: 20 },
  //         2: { cellWidth: 18 },
  //         3: { cellWidth: 18 },
  //         4: { cellWidth: 15 },
  //         5: { cellWidth: 20 },
  //         6: { cellWidth: 20 },
  //         7: { cellWidth: 16, halign: "center" },
  //         8: { cellWidth: 16, halign: "center" },
  //         9: { cellWidth: 15, halign: "right" },
  //         10: { cellWidth: 15, halign: "right" },
  //         11: { cellWidth: 15, halign: "right" },
  //       },
  //     );

  //     // 3. ENQUIRIES
  //     addSection(
  //       "ENQUIRIES",
  //       enquiries,
  //       [
  //         "ID",
  //         "Customer",
  //         "Mobile",
  //         "Vehicle",
  //         "Driver",
  //         "From",
  //         "To",
  //         "From Date",
  //         "To Date",
  //         "Total",
  //         "Advance",
  //         "Balance",
  //       ],
  //       {
  //         0: { cellWidth: 10, halign: "center" },
  //         1: { cellWidth: 20 },
  //         2: { cellWidth: 18 },
  //         3: { cellWidth: 18 },
  //         4: { cellWidth: 15 },
  //         5: { cellWidth: 20 },
  //         6: { cellWidth: 20 },
  //         7: { cellWidth: 16, halign: "center" },
  //         8: { cellWidth: 16, halign: "center" },
  //         9: { cellWidth: 15, halign: "right" },
  //         10: { cellWidth: 15, halign: "right" },
  //         11: { cellWidth: 15, halign: "right" },
  //       },
  //     );

  //     // 4. TRIPS
  //     addSection(
  //       "TRIPS",
  //       trips,
  //       [
  //         "ID",
  //         "Customer",
  //         "Mobile",
  //         "Vehicle",
  //         "Driver",
  //         "From",
  //         "To",
  //         "Start Date",
  //         "End Date",
  //         "Total",
  //         "Advance",
  //         "Balance",
  //         "KMs",
  //         "Net Profit",
  //       ],
  //       {
  //         0: { cellWidth: 8, halign: "center" },
  //         1: { cellWidth: 16 },
  //         2: { cellWidth: 14 },
  //         3: { cellWidth: 16 },
  //         4: { cellWidth: 12 },
  //         5: { cellWidth: 16 },
  //         6: { cellWidth: 16 },
  //         7: { cellWidth: 14, halign: "center" },
  //         8: { cellWidth: 14, halign: "center" },
  //         9: { cellWidth: 13, halign: "right" },
  //         10: { cellWidth: 13, halign: "right" },
  //         11: { cellWidth: 13, halign: "right" },
  //         12: { cellWidth: 10, halign: "center" },
  //         13: { cellWidth: 14, halign: "right" },
  //       },
  //     );

  //     // 5. MAINTENANCE
  //     addSection(
  //       "VEHICLE MAINTENANCE",
  //       maintenance,
  //       [
  //         "ID",
  //         "Vehicle",
  //         "Title",
  //         "Type",
  //         "Description",
  //         "Service Date",
  //         "Service KM",
  //         "Cost",
  //       ],
  //       {
  //         0: { cellWidth: 10, halign: "center" },
  //         1: { cellWidth: 25 },
  //         2: { cellWidth: 28 },
  //         3: { cellWidth: 18 },
  //         4: { cellWidth: 35 },
  //         5: { cellWidth: 20, halign: "center" },
  //         6: { cellWidth: 18, halign: "center" },
  //         7: { cellWidth: 18, halign: "right" },
  //       },
  //     );

  //     // 6. PROFILES
  //     addSection(
  //       "PROFILES",
  //       profiles,
  //       [
  //         "ID",
  //         "Full Name",
  //         "Mobile",
  //         "Email",
  //         "Aadhaar",
  //         "PAN",
  //         "License",
  //         "Address",
  //       ],
  //       {
  //         0: { cellWidth: 8, halign: "center" },
  //         1: { cellWidth: 22 },
  //         2: { cellWidth: 18 },
  //         3: { cellWidth: 28 },
  //         4: { cellWidth: 20 },
  //         5: { cellWidth: 18 },
  //         6: { cellWidth: 20 },
  //         7: { cellWidth: 35 },
  //       },
  //     );

  //     // Final Summary
  //     const finalY = doc.lastAutoTable?.finalY + 15 || 200;
      
  //     // Check if we need a new page for summary
  //     if (finalY > pageHeight - 40) {
  //       doc.addPage();
  //       doc.lastAutoTable = { finalY: 20 };
  //     }
      
  //     const summaryStartY = doc.lastAutoTable?.finalY + 15 || 200;
      
  //     doc.setFontSize(12);
  //     doc.setTextColor(0);
  //     doc.text("SUMMARY", 14, summaryStartY);

  //     doc.setFontSize(9);
  //     doc.setTextColor(80);
      
  //     const finalSummaryData = [
  //       ["Total Vehicles", vehicles.length],
  //       ["Total Orders", orders.length],
  //       ["Total Enquiries", enquiries.length],
  //       ["Total Trips", trips.length],
  //       ["Total Maintenance Records", maintenance.length],
  //       ["Total Profiles", profiles.length],
  //       ["GRAND TOTAL", totalRecords],
  //     ];

  //     let y = summaryStartY + 8;
  //     finalSummaryData.forEach((item, index) => {
  //       const xPos = 14 + (index % 3) * 70;
  //       const yOffset = Math.floor(index / 3) * 12;
  //       doc.setFontSize(9);
  //       doc.setTextColor(80);
  //       doc.text(`${item[0]}:`, xPos, y + yOffset);
  //       doc.setFontSize(11);
  //       doc.setTextColor(0);
  //       doc.text(String(item[1]), xPos + 45, y + yOffset);
  //     });

  //     // Save the PDF
  //     doc.save(
  //       `NJV_Travels_Complete_Data_${new Date().toISOString().split("T")[0]}.pdf`,
  //     );
  //     alert("PDF exported successfully! ✅");
  //   } catch (error) {
  //     console.error("Error exporting data:", error);
  //     alert("Error exporting data. Please try again.");
  //   } finally {
  //     setExporting(false);
  //   }
  // };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-200 rounded-full transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Export Data</h1>
            <p className="text-sm text-gray-500">
              Export all data from the system as a PDF report
            </p>
          </div>
        </div>

        {/* Export Button */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="p-4 bg-blue-50 rounded-full mb-4">
              <FileText size={48} className="text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Complete Data Export
            </h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              Export all data including Vehicles, Orders, Enquiries, Trips,
              Maintenance, and Profiles in a single PDF report
            </p>
            <button
              
              disabled={exporting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {exporting ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Generate PDF Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* What's Included */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            📋 What's Included:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              Vehicles
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              Orders
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              Enquiries
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Trips
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
              Maintenance
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
              Profiles
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">
            📌 How to export:
          </h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Click the <strong>"Generate PDF Report"</strong> button above</li>
            <li>• The system will fetch all data from the database</li>
            <li>• A comprehensive PDF report will be generated</li>
            <li>• The PDF will be automatically downloaded to your device</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportPDF;