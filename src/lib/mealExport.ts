import { format } from 'date-fns';
import { MealRecord } from '@/hooks/useMealTracking';

export interface ExportOptions {
  dogName: string;
  dogBreed?: string;
  dateRange: string;
  exportDate: string;
}

/**
 * Generate CSV content from meal records
 */
export function generateMealCSV(records: MealRecord[], options: ExportOptions): string {
  const headers = [
    'Date',
    'Meal Name',
    'Scheduled Time',
    'Completed',
    'Amount Given (cups)',
    'Amount Consumed (cups)',
    'Percentage Eaten (%)',
    'Eating Speed',
    'Eating Behavior',
    'Food Temperature',
    'Energy Level After',
    'Bowl Cleaned Before',
    'Begged Before',
    'Begged After',
    'Vomited After',
    'Vomit Time (minutes)',
    'Notes'
  ];

  const rows = records.map(record => [
    record.scheduled_date,
    record.meal_name,
    record.meal_time,
    record.completed_at ? 'Yes' : 'No',
    record.amount_given?.toString() || '',
    record.amount_consumed?.toString() || '',
    record.percentage_eaten?.toString() || '',
    record.eating_speed || '',
    record.eating_behavior || '',
    record.food_temperature || '',
    record.energy_level_after || '',
    record.bowl_cleaned_before ? 'Yes' : 'No',
    record.begged_before ? 'Yes' : 'No',
    record.begged_after ? 'Yes' : 'No',
    record.vomited_after ? 'Yes' : 'No',
    record.vomit_time_minutes?.toString() || '',
    record.notes ? `"${record.notes.replace(/"/g, '""')}"` : ''
  ]);

  // Add metadata header
  const metadata = [
    `Meal History Report for ${options.dogName}`,
    `Date Range: ${options.dateRange}`,
    `Generated: ${options.exportDate}`,
    '',
    ''
  ];

  const csvContent = [
    ...metadata,
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
}

/**
 * Download CSV file
 */
export function downloadCSV(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Generate printable HTML for PDF export
 */
export function generatePrintableHTML(records: MealRecord[], options: ExportOptions): string {
  const completedMeals = records.filter(r => r.completed_at).length;
  const totalMeals = records.length;
  const completionRate = totalMeals > 0 ? Math.round((completedMeals / totalMeals) * 100) : 0;
  
  const avgPercentageEaten = records.filter(r => r.percentage_eaten).length > 0
    ? Math.round(records.filter(r => r.percentage_eaten).reduce((sum, r) => sum + (r.percentage_eaten || 0), 0) / records.filter(r => r.percentage_eaten).length)
    : 0;

  const vomitIncidents = records.filter(r => r.vomited_after).length;
  
  // Group by date
  const recordsByDate = records.reduce((acc, record) => {
    if (!acc[record.scheduled_date]) {
      acc[record.scheduled_date] = [];
    }
    acc[record.scheduled_date].push(record);
    return acc;
  }, {} as Record<string, MealRecord[]>);

  const tableRows = Object.entries(recordsByDate)
    .map(([date, dayRecords]) => {
      return dayRecords.map((record, idx) => `
        <tr style="border-bottom: 1px solid #e5e7eb;">
          ${idx === 0 ? `<td rowspan="${dayRecords.length}" style="padding: 12px; font-weight: 600; vertical-align: top; border-right: 2px solid #e5e7eb;">${format(new Date(date), 'MMM d, yyyy')}</td>` : ''}
          <td style="padding: 12px;">${record.meal_time}</td>
          <td style="padding: 12px;">${record.meal_name}</td>
          <td style="padding: 12px; text-align: center;">${record.completed_at ? '✓' : '—'}</td>
          <td style="padding: 12px; text-align: center;">${record.percentage_eaten || '—'}%</td>
          <td style="padding: 12px;">${record.eating_speed || '—'}</td>
          <td style="padding: 12px;">${record.eating_behavior || '—'}</td>
          <td style="padding: 12px; text-align: center;">${record.vomited_after ? '⚠️' : '—'}</td>
          <td style="padding: 12px; font-size: 11px;">${record.notes || '—'}</td>
        </tr>
      `).join('');
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Meal History - ${options.dogName}</title>
      <style>
        @media print {
          @page { margin: 1cm; }
          body { margin: 0; }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          max-width: 100%;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 3px solid #3b82f6;
        }
        .header h1 {
          margin: 0 0 10px 0;
          color: #1f2937;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #6b7280;
          font-size: 14px;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: #f3f4f6;
          padding: 15px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-card .value {
          font-size: 24px;
          font-weight: bold;
          color: #3b82f6;
          margin-bottom: 5px;
        }
        .summary-card .label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
          font-size: 12px;
        }
        th {
          background-color: #f9fafb;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        td {
          color: #4b5563;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #9ca3af;
          font-size: 11px;
        }
        .alerts {
          background: #fef3c7;
          border: 1px solid #fbbf24;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 20px;
        }
        .alerts h3 {
          margin: 0 0 10px 0;
          color: #92400e;
          font-size: 14px;
        }
        .alerts ul {
          margin: 0;
          padding-left: 20px;
          color: #78350f;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Meal History Report</h1>
        <p><strong>${options.dogName}</strong>${options.dogBreed ? ` • ${options.dogBreed}` : ''}</p>
        <p>Period: ${options.dateRange}</p>
        <p>Generated: ${options.exportDate}</p>
      </div>

      <div class="summary">
        <div class="summary-card">
          <div class="value">${completionRate}%</div>
          <div class="label">Completion Rate</div>
        </div>
        <div class="summary-card">
          <div class="value">${completedMeals}</div>
          <div class="label">Meals Fed</div>
        </div>
        <div class="summary-card">
          <div class="value">${avgPercentageEaten}%</div>
          <div class="label">Avg Eaten</div>
        </div>
        <div class="summary-card">
          <div class="value">${vomitIncidents}</div>
          <div class="label">Vomit Incidents</div>
        </div>
      </div>

      ${vomitIncidents > 2 ? `
        <div class="alerts">
          <h3>⚠️ Veterinary Attention Recommended</h3>
          <ul>
            <li>${vomitIncidents} vomiting incidents recorded in this period</li>
            ${avgPercentageEaten < 70 ? `<li>Average food consumption is ${avgPercentageEaten}%, below healthy range</li>` : ''}
          </ul>
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Meal</th>
            <th style="text-align: center;">Fed</th>
            <th style="text-align: center;">Eaten</th>
            <th>Speed</th>
            <th>Behavior</th>
            <th style="text-align: center;">Vomit</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>

      <div class="footer">
        <p>This report was generated from Kahu - AI-Powered Dog Training & Wellness</p>
        <p>For veterinary use only. Please consult with a licensed veterinarian for medical advice.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Open print dialog for PDF export
 */
export function printToPDF(htmlContent: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    throw new Error('Unable to open print window. Please allow pop-ups for this site.');
  }
  
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  
  // Wait for content to load before printing
  printWindow.onload = () => {
    printWindow.focus();
    printWindow.print();
  };
}
