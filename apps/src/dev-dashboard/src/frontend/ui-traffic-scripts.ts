/**
 * @forge/dev-dashboard - Vercel-Style True Telemetry & 1-Year Observability Scripts (2026 LTS)
 * Dynamic Time Range Switcher (24h/7d/30d/90d/1y), SVG Area Chart, Insight Bars & Inspector.
 * @requirements [HLR-DEV-501] [LLR-TEL-001] [HLR-UI-401] [LLR-UI-001]
 */

export function getTrafficDashboardScripts(): string {
  return `
    let currentTelemetryRange = '24h';
    let currentTelemetryApp = 'all';
    let currentTelemetryCategory = 'user';
    try {
      const savedCat = localStorage.getItem('forge:traffic:category');
      if (savedCat) currentTelemetryCategory = savedCat;
    } catch {}
    let currentChartMetric = 'requests';
    let isIpMasked = false;
    let cachedInspectorEvents = [];
    let cachedTimeSeriesBuckets = [];
    let inspectorSearchFilter = '';

    async function loadTraffic() {
      const catPills = document.querySelectorAll('.category-pill');
      catPills.forEach(p => {
        if (p.getAttribute('data-category') === currentTelemetryCategory) p.classList.add('active');
        else p.classList.remove('active');
      });
      await loadTelemetryData();
    }

    async function loadTelemetryData() {
      await Promise.all([
        loadTelemetryOverview(),
        loadTelemetryTimeSeries(),
        loadTelemetryBreakdowns(),
        loadTelemetryInspector(),
      ]);
    }

    function setTelemetryCategory(category) {
      currentTelemetryCategory = category;
      try { localStorage.setItem('forge:traffic:category', category); } catch {}
      const pills = document.querySelectorAll('.category-pill');
      pills.forEach(p => {
        if (p.getAttribute('data-category') === category) p.classList.add('active');
        else p.classList.remove('active');
      });
      loadTelemetryData();
    }

    function setTelemetryRange(range) {
      currentTelemetryRange = range;
      const pills = document.querySelectorAll('.range-pill');
      pills.forEach(p => {
        if (p.getAttribute('data-range') === range) p.classList.add('active');
        else p.classList.remove('active');
      });
      loadTelemetryData();
    }

    function onTelemetryAppChange(appId) {
      currentTelemetryApp = appId;
      loadTelemetryData();
    }

    function toggleIpMasking() {
      isIpMasked = !isIpMasked;
      const btn = document.getElementById('btn-toggle-mask-ip');
      if (btn) {
        btn.textContent = isIpMasked ? '🔒 Masked IP' : '👁️ Raw IP';
        btn.style.color = isIpMasked ? 'var(--forge-warning)' : 'inherit';
      }
      loadTelemetryInspector();
    }

    function setChartMetric(metric) {
      currentChartMetric = metric;
      const btns = document.querySelectorAll('.metric-btn');
      btns.forEach(b => {
        if (b.getAttribute('data-metric') === metric) b.classList.add('active');
        else b.classList.remove('active');
      });
      renderTelemetryTimelineChart(cachedTimeSeriesBuckets, metric);
    }

    async function loadTelemetryOverview() {
      try {
        const url = apiBase + '/api/analytics/overview?range=' + currentTelemetryRange + '&appId=' + currentTelemetryApp + '&category=' + currentTelemetryCategory;
        const res = await fetch(url).then(r => r.json());
        if (res && res.status === 'ok' && res.data) {
          const d = res.data;
          const visEl = document.getElementById('tel-kpi-visitors');
          const reqEl = document.getElementById('tel-kpi-requests');
          const rpsEl = document.getElementById('tel-kpi-rps');
          const p50El = document.getElementById('tel-kpi-p50');
          const p99El = document.getElementById('tel-kpi-p99');
          const sloEl = document.getElementById('traffic-signal-slo');
          const succEl = document.getElementById('tel-kpi-success-rate');
          const errEl = document.getElementById('tel-kpi-err-count');
          const bwEl = document.getElementById('tel-kpi-bandwidth');
          const bwUnitEl = document.getElementById('tel-kpi-bandwidth-unit');
          const bwAvgEl = document.getElementById('tel-kpi-bandwidth-avg');

          if (visEl) visEl.textContent = Number(d.uniqueVisitors || 0).toLocaleString();
          if (reqEl) reqEl.textContent = Number(d.totalRequests || 0).toLocaleString();
          if (rpsEl) rpsEl.textContent = (d.throughputRps || 0) + ' req/sec';
          if (p50El) p50El.textContent = (d.p50LatencyMs || 0).toFixed(2);
          if (p99El) p99El.textContent = 'p90: ' + (d.p90LatencyMs || 0).toFixed(1) + 'ms • p99: ' + (d.p99LatencyMs || 0).toFixed(1) + 'ms';
          if (sloEl) {
            const met = (d.p50LatencyMs || 0) < 2.0;
            sloEl.textContent = met ? 'SLO MET (<2ms)' : 'SLO WARNING';
            sloEl.style.color = met ? 'var(--forge-success)' : 'var(--forge-accent)';
          }
          if (succEl) succEl.textContent = (d.statusBreakdown?.successRatePct || 100.0).toFixed(1);
          if (errEl) errEl.textContent = '4xx: ' + (d.statusBreakdown?.s4xx || 0) + ' • 5xx: ' + (d.statusBreakdown?.s5xx || 0);

          if (bwEl) {
            const kb = (d.totalBytes || 0) / 1024;
            if (kb >= 1024 * 1024) {
              bwEl.textContent = (kb / (1024 * 1024)).toFixed(2);
              if (bwUnitEl) bwUnitEl.textContent = 'GB';
            } else if (kb >= 1024) {
              bwEl.textContent = (kb / 1024).toFixed(1);
              if (bwUnitEl) bwUnitEl.textContent = 'MB';
            } else {
              bwEl.textContent = kb.toFixed(0);
              if (bwUnitEl) bwUnitEl.textContent = 'KB';
            }
          }
          if (bwAvgEl) {
            const avgB = (d.totalBytes || 0) / Math.max(1, d.totalRequests || 1);
            bwAvgEl.textContent = (avgB >= 1024 ? (avgB / 1024).toFixed(1) + ' KB' : Math.round(avgB) + ' B') + ' / req';
          }
        }
      } catch (err) {
        console.error('Failed to load telemetry overview', err);
      }
    }

    async function loadTelemetryTimeSeries() {
      try {
        const url = apiBase + '/api/analytics/timeseries?range=' + currentTelemetryRange + '&appId=' + currentTelemetryApp + '&category=' + currentTelemetryCategory;
        const res = await fetch(url).then(r => r.json());
        cachedTimeSeriesBuckets = res.buckets || [];
        renderTelemetryTimelineChart(cachedTimeSeriesBuckets, currentChartMetric);
      } catch (err) {
        console.error('Failed to load telemetry time series', err);
      }
    }

    function renderTelemetryTimelineChart(buckets, metric) {
      const container = document.getElementById('traffic-timeline-chart');
      if (!container) return;

      if (!buckets || !buckets.length) {
        container.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--forge-text-muted); font-size:0.75rem;">No telemetry data available for this range. Click "Seed 1-Year" to preview historical analytics.</div>';
        return;
      }

      const w = 840, h = 130, padL = 35, padR = 25, padT = 15, padB = 25;
      const chartW = w - padL - padR, chartH = h - padT - padB;

      let vals = [];
      if (metric === 'visitors') vals = buckets.map(b => b.uniqueVisitors || 0);
      else if (metric === 'latency') vals = buckets.map(b => b.p50LatencyMs || 0);
      else if (metric === 'bandwidth') vals = buckets.map(b => (b.bytesTransferred || 0) / 1024);
      else vals = buckets.map(b => (b.count2xx + b.count3xx + b.count4xx + b.count5xx) || b.totalRequests || 0);

      const maxVal = Math.max(...vals, 1);
      const barWidth = Math.max(3, (chartW / buckets.length) - 2);

      let svgHtml = '<svg class="timeline-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';

      // Gridlines
      svgHtml += '<line x1="' + padL + '" y1="' + (padT + chartH / 2) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH / 2) + '" stroke="var(--forge-border)" stroke-dasharray="3,3" />';
      svgHtml += '<line x1="' + padL + '" y1="' + (padT + chartH) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH) + '" stroke="var(--forge-border)" />';

      // Render series bars & points
      const trendPoints = [];
      const step = chartW / buckets.length;

      buckets.forEach((b, i) => {
        const x = padL + (i * step);
        const val = vals[i];
        const barH = Math.max(2, (val / maxVal) * chartH);
        const curY = padT + chartH - barH;

        // Bar coloring
        let barColor = 'var(--forge-primary)';
        if (metric === 'requests') {
          barColor = (b.count4xx + b.count5xx) > 0 ? 'var(--forge-accent)' : 'var(--forge-success)';
        } else if (metric === 'latency') {
          barColor = val > 2.0 ? 'var(--forge-accent)' : 'var(--forge-primary)';
        }

        svgHtml += '<rect x="' + x + '" y="' + curY + '" width="' + barWidth + '" height="' + barH + '" fill="' + barColor + '" rx="1" opacity="0.85"><title>' + b.timeLabel + ' | ' + val.toLocaleString() + ' (' + metric + ')</title></rect>';

        // Trend line coordinates
        trendPoints.push((x + barWidth / 2) + ',' + Math.max(padT, Math.min(padT + chartH, curY)));

        // X-axis label
        const labelInterval = Math.max(1, Math.floor(buckets.length / 8));
        if (i % labelInterval === 0) {
          svgHtml += '<text x="' + (x + barWidth / 2) + '" y="' + (h - 6) + '" font-size="9" fill="var(--forge-text-subtle)" text-anchor="middle" font-family="monospace">' + b.timeLabel + '</text>';
        }
      });

      if (trendPoints.length > 1) {
        svgHtml += '<polyline points="' + trendPoints.join(' ') + '" fill="none" stroke="var(--forge-primary)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />';
      }

      svgHtml += '</svg>';
      container.innerHTML = svgHtml;
    }

    async function loadTelemetryBreakdowns() {
      try {
        const url = apiBase + '/api/analytics/breakdowns?range=' + currentTelemetryRange + '&appId=' + currentTelemetryApp + '&category=' + currentTelemetryCategory;
        const res = await fetch(url).then(r => r.json());
        if (res && res.status === 'ok' && res.breakdowns) {
          const b = res.breakdowns;
          renderInsightCard('insight-top-routes', b.topRoutes || [], 'count-top-routes');
          renderInsightCard('insight-countries', b.countries || [], 'count-countries', true);
          renderInsightCard('insight-os', b.operatingSystems || [], 'count-os');
          renderInsightCard('insight-browsers', b.browsers || [], 'count-browsers');
          renderInsightCard('insight-devices', b.devices || [], null);
          renderInsightCard('insight-referrers', b.referrers || [], null);
        }
      } catch (err) {
        console.error('Failed to load telemetry breakdowns', err);
      }
    }

    function renderInsightCard(containerId, items, countBadgeId, isCountry = false) {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (countBadgeId) {
        const badge = document.getElementById(countBadgeId);
        if (badge) badge.textContent = items.length + ' items';
      }

      if (!items || !items.length) {
        container.innerHTML = '<div class="insight-loading">No records captured for this range.</div>';
        return;
      }

      container.innerHTML = items.map(it => {
        const flagPrefix = isCountry && it.extra ? '<span class="country-flag-badge">' + it.extra + '</span> ' : '';
        const extraSuffix = !isCountry && it.extra ? '<span style="font-size:0.7rem; color:var(--forge-text-subtle);">(' + it.extra + ')</span>' : '';

        return \`
          <div class="insight-row">
            <div class="insight-bar-fill" style="width: \${it.percentage}%;"></div>
            <div class="insight-label-wrap">
              \${flagPrefix}<span>\${it.label}</span>\${extraSuffix}
            </div>
            <div class="insight-val-wrap">
              <strong>\${it.count.toLocaleString()}</strong>
              <span>\${it.percentage}%</span>
            </div>
          </div>
        \`;
      }).join('');
    }

    async function loadTelemetryInspector() {
      try {
        const url = apiBase + '/api/analytics/inspector?limit=40&masked=' + isIpMasked + '&search=' + encodeURIComponent(inspectorSearchFilter) + '&category=' + currentTelemetryCategory;
        const res = await fetch(url).then(r => r.json());
        cachedInspectorEvents = res.events || [];
        renderInspectorTable(cachedInspectorEvents);
      } catch (err) {
        console.error('Failed to load telemetry inspector', err);
      }
    }

    function onInspectorSearchChange(val) {
      inspectorSearchFilter = (val || '').trim();
      loadTelemetryInspector();
    }

    function renderInspectorTable(events) {
      const container = document.getElementById('telemetry-inspector-container');
      if (!container) return;

      if (!events || !events.length) {
        container.innerHTML = '<div style="padding:1.5rem; text-align:center; color:var(--forge-text-muted); font-size:0.75rem;">No matching client requests found.</div>';
        return;
      }

      container.innerHTML = \`
        <table class="data-table">
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Client IP & Location</th>
              <th>Machine & OS</th>
              <th>Browser</th>
              <th>Screen</th>
              <th>Method & Path</th>
              <th>Status</th>
              <th>Latency</th>
              <th>Trace ID</th>
            </tr>
          </thead>
          <tbody>
            \${events.map(e => {
              const cat = e.category || 'user';
              const catClass = 'badge-cat-' + cat;
              const catLabel = cat === 'probe' ? 'PROBE' : (cat === 'mesh' ? 'MESH' : 'USER');
              const methodClass = 'method-' + (e.method || 'get').toLowerCase();
              const statusClass = e.statusCode < 300 ? 'status-2xx' : (e.statusCode < 400 ? 'status-3xx' : (e.statusCode < 500 ? 'status-4xx' : 'status-5xx'));
              const traceTag = e.traceId
                ? '<span class="log-trace-tag" onclick="filterByTraceId(\\'' + e.traceId + '\\')" title="Inspect Trace">#' + e.traceId.slice(0, 8) + '</span>'
                : '<span style="color:var(--forge-text-subtle);">--</span>';

              return \`
                <tr>
                  <td style="font-family:monospace; font-size:0.72rem; color:var(--forge-text-subtle);">\${e.timeStr}</td>
                  <td><span class="\${catClass}">\${catLabel}</span></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <span class="country-flag-badge" title="\${e.countryName}">\${e.flagEmoji}</span>
                      <code class="inspector-ip-pill">\${e.clientIp}</code>
                    </div>
                  </td>
                  <td><span style="font-size:0.74rem; font-weight:500;">\${e.os}</span></td>
                  <td><span style="font-size:0.74rem; color:var(--forge-text-muted);">\${e.browser}</span></td>
                  <td><span class="astryx-micro-pill">\${e.screenRes}</span></td>
                  <td>
                    <div style="display:flex; align-items:center; gap:0.35rem;">
                      <span class="method-pill \${methodClass}">\${e.method}</span>
                      <code class="astryx-code-badge" style="font-size:0.74rem;">\${e.path}</code>
                    </div>
                  </td>
                  <td><span class="\${statusClass}">\${e.statusCode}</span></td>
                  <td><span class="latency-pill \${e.durationMs < 2 ? 'latency-fast' : 'latency-medium'}">\${e.durationMs}ms</span></td>
                  <td>\${traceTag}</td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      \`;
    }

    async function promptSeedHistorical() {
      if (typeof window.astryxToast === 'function') {
        window.astryxToast('⚡ Seeding 365 days of realistic historical telemetry rollups...', 'info');
      }
      try {
        const res = await fetch(apiBase + '/api/analytics/seed-historical', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ days: 365 }),
        }).then(r => r.json());

        if (res && res.success) {
          if (typeof window.astryxToast === 'function') {
            window.astryxToast('Successfully seeded 1 year of historical telemetry (' + res.rollupsSeeded + ' rollups).', 'success');
          }
          setTelemetryRange('1y');
        } else {
          if (typeof window.astryxToast === 'function') {
            window.astryxToast('Failed to seed telemetry: ' + (res.error || 'unknown error'), 'warning');
          }
        }
      } catch (err) {
        if (typeof window.astryxToast === 'function') {
          window.astryxToast('Error executing telemetry seeder: ' + err, 'warning');
        }
      }
    }

    function exportTelemetryCsv() {
      window.location.href = apiBase + '/api/analytics/export?range=' + currentTelemetryRange + '&category=' + currentTelemetryCategory;
    }

    async function runCustomTargetBenchmark() {
      const target = document.getElementById('benchmark-target-select')?.value || 'dev-dashboard';
      const samples = Number(document.getElementById('benchmark-samples-select')?.value || 50);
      const concurrency = Number(document.getElementById('benchmark-concurrency-select')?.value || 5);
      const btn = document.getElementById('btn-run-stress-test');
      const scorecard = document.getElementById('traffic-benchmark-scorecard');

      if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⚡ Stress Testing (' + samples + ' reqs)...';
      }
      if (scorecard) {
        scorecard.innerHTML = '<div style="padding:0.75rem; text-align:center; color:var(--forge-primary); font-size:0.82rem;">Dispatching ' + samples + ' concurrent HTTP requests to ' + target + '...</div>';
      }

      try {
        const res = await fetch(apiBase + '/api/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target, samples, concurrency }),
        }).then(r => r.json());

        if (scorecard && res.status === 'ok') {
          scorecard.innerHTML = \`
            <div class="benchmark-scorecard-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(130px, 1fr)); gap:0.5rem; margin-top:0.6rem; padding:0.6rem; background:var(--forge-bg-surface); border:1px solid var(--forge-border); border-radius:var(--forge-radius);">
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">Target</span>
                <strong style="color:var(--forge-primary); font-size:0.82rem;">\${res.target}</strong>
              </div>
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">p50 Latency</span>
                <strong style="color:var(--forge-success); font-size:0.82rem;">\${res.p50Ms}ms</strong>
              </div>
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">p90 Latency</span>
                <strong style="font-size:0.82rem;">\${res.p90Ms}ms</strong>
              </div>
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">Peak (p99)</span>
                <strong style="color:\${res.p99Ms > 10 ? 'var(--forge-accent)' : 'var(--forge-text-main)'}; font-size:0.82rem;">\${res.p99Ms}ms</strong>
              </div>
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">Throughput</span>
                <strong style="color:var(--forge-primary); font-size:0.82rem;">\${res.reqPerSec} req/s</strong>
              </div>
              <div class="scorecard-item">
                <span style="font-size:0.68rem; color:var(--forge-text-muted); display:block;">Verdict</span>
                <span class="astryx-badge \${res.targetMet ? 'badge-running' : 'badge-degraded'}" style="margin-top:2px;">\${res.targetMet ? 'SLO MET' : 'WARNING'}</span>
              </div>
            </div>
          \`;
        }
      } catch (err) {
        if (scorecard) scorecard.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Benchmark request failed.</div>';
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '⚡ Run Stress Test';
        }
      }
    }
  `;
}
