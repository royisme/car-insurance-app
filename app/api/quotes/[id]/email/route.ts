import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

// POST /api/quotes/[id]/email - Send quote by email
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { email } = await request.json();
    
    // Validate email
    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }
    
    // Fetch quote
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        province: true,
        vehicles: {
          include: {
            model: {
              include: {
                make: true
              }
            }
          }
        },
        selectedCoverages: {
          include: {
            coverage: true
          }
        }
      }
    });
    
    if (!quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }
    
    // Send email
    const { data, error } = await resend.emails.send({
      from: 'insurance-quote@yourdomain.com',
      to: email,
      subject: `Your Insurance Quote Reference #${quote.referenceNumber}`,
      html: generateQuoteEmailHtml(quote)
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    // Update quote status
    await prisma.quote.update({
      where: { id },
      data: {
        status: 'emailed'
      }
    });
    
    return NextResponse.json({ success: true, messageId: data?.id });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

// Generate HTML email template for quote
function generateQuoteEmailHtml(quote: any) {
  // Format vehicle info
  const vehicle = quote.vehicles[0];
  const vehicleInfo = `${vehicle.year} ${vehicle.model.make.name} ${vehicle.model.name}`;
  
  // Format coverages
  const mandatoryCoverages = quote.selectedCoverages
    .filter((c: any) => c.coverage.isMandatory)
    .map((c: any) => {
      const value = c.amount 
        ? `$${parseInt(c.amount).toLocaleString()}`
        : c.deductible 
          ? `$${c.deductible.toLocaleString()} deductible`
          : '';
      
      return `<tr>
        <td style="padding: 8px;">${c.coverage.name_en}</td>
        <td style="padding: 8px;">${value}</td>
        <td style="padding: 8px; text-align: right;">$${c.premium.toFixed(2)}</td>
      </tr>`;
    })
    .join('');
  
  const optionalCoverages = quote.selectedCoverages
    .filter((c: any) => !c.coverage.isMandatory)
    .map((c: any) => {
      const value = c.deductible 
        ? `$${c.deductible.toLocaleString()} deductible`
        : '';
      
      return `<tr>
        <td style="padding: 8px;">${c.coverage.name_en}</td>
        <td style="padding: 8px;">${value}</td>
        <td style="padding: 8px; text-align: right;">$${c.premium.toFixed(2)}</td>
      </tr>`;
    })
    .join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; }
        .section-title { border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 15px; }
        table { width: 100%; border-collapse: collapse; }
        th { text-align: left; padding: 8px; background-color: #f8f8f8; }
        td { padding: 8px; border-top: 1px solid #ddd; }
        .price-total { font-size: 18px; font-weight: bold; }
        .footer { font-size: 12px; color: #777; text-align: center; margin-top: 30px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Insurance Quote</h1>
          <p>Reference #: ${quote.referenceNumber}</p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Customer Information</h2>
          <p>
            ${quote.firstName} ${quote.lastName}<br>
            ${quote.addressLine1}<br>
            ${quote.addressLine2 ? quote.addressLine2 + '<br>' : ''}
            ${quote.city}, ${quote.province.name_en} ${quote.postalCode}<br>
            ${quote.email}<br>
            ${quote.phone || ''}
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Vehicle Information</h2>
          <p>
            <strong>Vehicle:</strong> ${vehicleInfo}<br>
            <strong>Type:</strong> ${vehicle.type}<br>
            <strong>Year:</strong> ${vehicle.year}<br>
          </p>
        </div>
        
        <div class="section">
          <h2 class="section-title">Coverage Details</h2>
          
          <h3>Mandatory Coverage</h3>
          <table>
            <thead>
              <tr>
                <th>Coverage</th>
                <th>Limit/Deductible</th>
                <th style="text-align: right;">Premium</th>
              </tr>
            </thead>
            <tbody>
              ${mandatoryCoverages}
            </tbody>
          </table>
          
          ${optionalCoverages ? `
            <h3>Optional Coverage</h3>
            <table>
              <thead>
                <tr>
                  <th>Coverage</th>
                  <th>Deductible</th>
                  <th style="text-align: right;">Premium</th>
                </tr>
              </thead>
              <tbody>
                ${optionalCoverages}
              </tbody>
            </table>
          ` : ''}
        </div>
        
        <div class="section">
          <h2 class="section-title">Premium Summary</h2>
          <table>
            <tr>
              <td>Base Premium</td>
              <td style="text-align: right;">$${quote.basePremium.toFixed(2)}</td>
            </tr>
            ${quote.discountAmount > 0 ? `
              <tr>
                <td>Discounts</td>
                <td style="text-align: right; color: green;">-$${quote.discountAmount.toFixed(2)}</td>
              </tr>
            ` : ''}
            <tr>
              <td>Fees</td>
              <td style="text-align: right;">$${quote.fees.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Taxes</td>
              <td style="text-align: right;">$${quote.taxes.toFixed(2)}</td>
            </tr>
            <tr class="price-total">
              <td>Annual Premium</td>
              <td style="text-align: right;">$${quote.annualPremium.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Monthly Premium</td>
              <td style="text-align: right;">$${quote.monthlyPremium.toFixed(2)}</td>
            </tr>
          </table>
        </div>
        
        <div class="footer">
          <p>This quote is valid for 30 days from ${new Date(quote.createdAt).toLocaleDateString()}.</p>
          <p>For questions or to purchase, please contact us at 1-800-123-4567 or email support@example.com.</p>
          <p>This is a demo quote generated for demonstration purposes only.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
