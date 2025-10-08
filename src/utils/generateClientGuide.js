const escapeHtml = (value = '') =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const formatCarePoint = (label, value) => {
  if (!value) {
    return '';
  }
  return `<span class="care-point"><strong>${escapeHtml(label)}:</strong> ${escapeHtml(value)}</span>`;
};

const formatPlantCard = (plant) => {
  const highlights = [
    formatCarePoint('Light', plant.light),
    formatCarePoint('Water', plant.water),
    formatCarePoint('Soil', plant.soil),
    formatCarePoint('Type', plant.type),
  ]
    .filter(Boolean)
    .join('');

  return `
    <article class="plant-card">
      <header>
        <h3>${escapeHtml(plant.name)}</h3>
        ${plant.scientific ? `<p class="scientific">${escapeHtml(plant.scientific)}</p>` : ''}
      </header>
      ${
        plant.aesthetic || plant.benefits
          ? `<p class="description">${escapeHtml(plant.aesthetic || plant.benefits)}</p>`
          : ''
      }
      ${highlights ? `<div class="care-grid">${highlights}</div>` : ''}
      ${
        Array.isArray(plant.zones) && plant.zones.length > 0
          ? `<p class="zones"><strong>Placement:</strong> ${plant.zones.map(escapeHtml).join(', ')}</p>`
          : ''
      }
    </article>
  `;
};

const generateClientGuideHTML = ({ project, businessDetails }) => {
  const {
    clientName,
    projectAddress,
    plants = [],
    clientNotes,
    dateCompleted,
    dateCreated,
  } = project;

  const formattedDate = (() => {
    const sourceDate = dateCompleted || dateCreated;
    if (!sourceDate) {
      return '';
    }
    try {
      const date =
        typeof sourceDate === 'string' || typeof sourceDate === 'number'
          ? new Date(sourceDate)
          : sourceDate;
      if (Number.isNaN(date.getTime())) {
        return '';
      }
      return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return '';
    }
  })();

  const introCopy = `
    <p class="intro">
      Introducing your new landscape — designed and built by ${escapeHtml(
        businessDetails.tagline
      )} to bring lasting beauty to your home. Each plant was carefully selected for its look,
      resilience, and compatibility with Austin’s unique climate. With a little attention throughout
      the year, your landscape will continue to thrive and evolve beautifully.
    </p>
    <p class="intro">
      Please share this guide with your maintenance or lawn care professional. Proper upkeep ensures
      that your landscape matures as designed and stays healthy year-round.
    </p>
  `;

  const notesSection =
    clientNotes && clientNotes.trim().length > 0
      ? `<section>
          <h2>Personal Notes</h2>
          <p class="notes">${escapeHtml(clientNotes)}</p>
        </section>`
      : '';

  const plantSection =
    plants.length > 0
      ? `<section>
          <h2>Featured Plantings</h2>
          <div class="plant-grid">
            ${plants.map(formatPlantCard).join('')}
          </div>
        </section>`
      : `<section>
          <h2>Featured Plantings</h2>
          <p class="intro">Plant selections will populate here once your project checklist is complete.</p>
        </section>`;

  const projectMeta = [
    clientName ? `<span><strong>Homeowner:</strong> ${escapeHtml(clientName)}</span>` : '',
    projectAddress ? `<span><strong>Project Address:</strong> ${escapeHtml(projectAddress)}</span>` : '',
    formattedDate ? `<span><strong>Project Completed:</strong> ${escapeHtml(formattedDate)}</span>` : '',
  ]
    .filter(Boolean)
    .join('<span class="divider">•</span>');

  const footerLeft = [businessDetails.name, businessDetails.phone].filter(Boolean).join(' • ');
  const footerRight = businessDetails.website || '';

  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>Landscape Care Guide – ${escapeHtml(clientName || 'Structure Landscapes Client')}</title>
        <style>
          :root {
            --deep-green: #043b09;
            --primary-green: #07680e;
            --accent-green: #80cc28;
            --charcoal: #1f2124;
            --muted: #4d4d4d;
            --cream: #f5f5f0;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: var(--charcoal);
            background: var(--cream);
            padding: 48px 56px;
            line-height: 1.6;
          }
          header {
            border-left: 8px solid var(--primary-green);
            padding-left: 28px;
            margin-bottom: 36px;
          }
          h1 {
            margin: 0;
            font-size: 36px;
            line-height: 1.1;
            font-weight: 800;
            color: var(--primary-green);
          }
          .byline {
            margin: 12px 0 0;
            font-size: 18px;
            color: var(--muted);
          }
          .meta {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 18px;
            font-size: 14px;
            color: var(--muted);
          }
          .divider {
            color: rgba(31, 33, 36, 0.3);
          }
          .intro {
            font-size: 16px;
            margin: 14px 0;
          }
          section {
            margin-top: 40px;
          }
          h2 {
            font-size: 24px;
            margin-bottom: 16px;
            color: var(--deep-green);
          }
          .plant-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 18px;
          }
          .plant-card {
            background: #fff;
            border-radius: 14px;
            padding: 20px;
            border: 1px solid rgba(7, 104, 14, 0.12);
            box-shadow: 0 12px 24px rgba(4, 59, 9, 0.08);
          }
          .plant-card h3 {
            margin: 0;
            font-size: 18px;
            color: var(--primary-green);
          }
          .plant-card .scientific {
            margin: 4px 0 12px;
            font-size: 13px;
            color: var(--muted);
            font-style: italic;
          }
          .plant-card .description {
            margin-bottom: 12px;
            font-size: 14px;
          }
          .care-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
            margin-bottom: 10px;
          }
          .care-point {
            font-size: 12px;
            padding: 6px 10px;
            background: rgba(7, 104, 14, 0.08);
            border-radius: 999px;
            display: inline-flex;
            gap: 4px;
          }
          .zones {
            font-size: 13px;
            color: var(--muted);
            margin-top: 4px;
          }
          .notes {
            background: #fff;
            border-left: 4px solid var(--accent-green);
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 6px 18px rgba(128, 204, 40, 0.15);
          }
          footer {
            margin-top: 48px;
            font-size: 12px;
            color: rgba(31, 33, 36, 0.6);
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          @media print {
            body {
              padding: 32px 36px;
            }
            .plant-card {
              box-shadow: none;
            }
            footer {
              position: fixed;
              bottom: 24px;
              left: 36px;
              right: 36px;
            }
          }
        </style>
      </head>
      <body>
        <header>
          <h1>Landscape Care Guide</h1>
          <p class="byline">By ${escapeHtml(businessDetails.name)} – ${escapeHtml(
            businessDetails.location
          )}</p>
          ${projectMeta ? `<div class="meta">${projectMeta}</div>` : ''}
        </header>
        <main>
          ${introCopy}
          ${notesSection}
          ${plantSection}
        </main>
        ${footerLeft || footerRight ? `<footer>
          <span>${escapeHtml(footerLeft)}</span>
          <span>${escapeHtml(footerRight)}</span>
        </footer>` : ''}
      </body>
    </html>
  `;
};

export default generateClientGuideHTML;
