/**
 * @forge/dev-dashboard - Traffic Analytics & Latency Benchmark Client Scripts (2026 LTS)
 * Enterprise SRE Golden Signals, Interactive Time-Series SVG Chart, Multi-Target Benchmark.
  * @requirements [HLR-UI-401] [LLR-UI-001]
 */

export function getTrafficDashboardScripts(): string {
  return `
    let cachedTrafficEvents = [];
    let trafficSearchFilter = '';

    async function loadTraffic() {
      if (window._initialTrafficTarget) {
        const targetSel = document.getElementById('benchmark-target-select');
        if (targetSel) {
          for (let i = 0; i < targetSel.options.length; i++) {
            if (targetSel.options[i].value === window._initialTrafficTarget || targetSel.options[i].text.includes(window._initialTrafficTarget)) {
              targetSel.selectedIndex = i;
              break;
            }
          }
        }
        window._initialTrafficTarget = null;
      }

      await Promise.all([
        loadTrafficMetrics(),
        loadTrafficRoutes(),
        loadTrafficEvents(),
      ]);
    }

    async function loadTrafficMetrics() {
      try {
        const res = await fetch(apiBase + '/api/analytics/traffic/metrics').then(r => r.json());
        if (res && res.status === 'ok') {
          updateTrafficGoldenSignals(res);
          renderTrafficTimelineChart(res.timeSeriesBuckets || []);
        }
      } catch (err) {
        console.error('Failed to load traffic metrics', err);
      }
    }

    function updateTrafficGoldenSignals(m) {
      const rpsEl = document.getElementById('traffic-signal-rps');
      const count24hEl = document.getElementById('traffic-signal-24h');
      const p50El = document.getElementById('traffic-signal-p50');
      const p99El = document.getElementById('traffic-signal-p99');
      const sloEl = document.getElementById('traffic-signal-slo');
      const successRateEl = document.getElementById('traffic-signal-success-rate');
      const errCountEl = document.getElementById('traffic-signal-err-count');
      const payloadEl = document.getElementById('traffic-signal-payload');

      if (rpsEl) rpsEl.textContent = m.throughputRps;
      if (count24hEl) count24hEl.textContent = (m.totalRequests24h || 0) + ' requests';
      if (p50El) p50El.textContent = m.latencyPercentiles.p50Ms;
      if (p99El) p99El.textContent = m.latencyPercentiles.p99Ms + ' ms';
      if (sloEl) {
        sloEl.textContent = m.latencyPercentiles.p50Ms < 2.0 ? 'SLO MET (<2ms)' : 'SLO WARNING';
        sloEl.style.color = m.latencyPercentiles.p50Ms < 2.0 ? 'var(--forge-success)' : 'var(--forge-accent)';
      }
      if (successRateEl) successRateEl.textContent = m.statusBreakdown.successRatePct;
      if (errCountEl) {
        errCountEl.textContent = '4xx: ' + m.statusBreakdown.s4xxCount + ' • 5xx: ' + m.statusBreakdown.s5xxCount;
      }
      if (payloadEl) {
        const kb = (m.totalPayloadBytesEstimated / 1024).toFixed(1);
        payloadEl.textContent = kb >= 1024 ? (kb / 1024).toFixed(2) + ' MB' : kb + ' KB';
      }
      const payloadAvgEl = document.getElementById('traffic-signal-payload-avg');
      if (payloadAvgEl) {
        const totalReqs = m.totalRequestsAllTime || 1;
        const avgKb = ((m.totalPayloadBytesEstimated || 0) / totalReqs / 1024).toFixed(2);
        payloadAvgEl.textContent = avgKb + ' KB / req';
      }
    }

    function renderTrafficTimelineChart(buckets) {
      const container = document.getElementById('traffic-timeline-chart');
      if (!container) return;

      if (!buckets || !buckets.length) {
        container.innerHTML = '<div style="display:flex; align-items:center; justify-content:center; height:100%; color:var(--forge-text-muted); font-size:0.75rem;">No time-series data available yet.</div>';
        return;
      }

      const w = 800, h = 120, padL = 30, padR = 20, padT = 15, padB = 25;
      const chartW = w - padL - padR, chartH = h - padT - padB;
      const counts = buckets.map(b => (b.count2xx + b.count3xx + b.count4xx + b.count5xx) || 0);
      const maxCount = Math.max(...counts, 5);
      const latencies = buckets.map(b => b.p50LatencyMs || 0);
      const maxLat = Math.max(...latencies, 3);

      const barWidth = Math.max(6, (chartW / buckets.length) - 8);
      let svgHtml = '<svg class="timeline-svg" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none">';

      // Gridlines
      svgHtml += '<line x1="' + padL + '" y1="' + (padT + chartH / 2) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH / 2) + '" stroke="var(--forge-border)" stroke-dasharray="3,3" />';
      svgHtml += '<line x1="' + padL + '" y1="' + (padT + chartH) + '" x2="' + (w - padR) + '" y2="' + (padT + chartH) + '" stroke="var(--forge-border)" />';

      // Bars for HTTP status codes
      const polyPoints = [];
      buckets.forEach((b, i) => {
        const x = padL + (i * (chartW / buckets.length)) + (chartW / buckets.length - barWidth) / 2;
        const total = b.count2xx + b.count3xx + b.count4xx + b.count5xx;
        const totalH = total > 0 ? (total / maxCount) * chartH : 2;

        const h2 = (b.count2xx / maxCount) * chartH;
        const h4 = (b.count4xx / maxCount) * chartH;
        const h5 = (b.count5xx / maxCount) * chartH;

        let curY = padT + chartH;

        if (h2 > 0) {
          curY -= h2;
          svgHtml += '<rect x="' + x + '" y="' + curY + '" width="' + barWidth + '" height="' + h2 + '" fill="var(--forge-success)" rx="2" opacity="0.85"><title>' + b.timeLabel + ' | 2xx: ' + b.count2xx + '</title></rect>';
        }
        if (h4 > 0) {
          curY -= h4;
          svgHtml += '<rect x="' + x + '" y="' + curY + '" width="' + barWidth + '" height="' + h4 + '" fill="var(--forge-accent)" rx="2" opacity="0.9"><title>' + b.timeLabel + ' | 4xx: ' + b.count4xx + '</title></rect>';
        }
        if (h5 > 0) {
          curY -= h5;
          svgHtml += '<rect x="' + x + '" y="' + curY + '" width="' + barWidth + '" height="' + h5 + '" fill="var(--forge-accent)" rx="2"><title>' + b.timeLabel + ' | 5xx: ' + b.count5xx + '</title></rect>';
        }
        if (total === 0) {
          svgHtml += '<rect x="' + x + '" y="' + (padT + chartH - 2) + '" width="' + barWidth + '" height="2" fill="var(--forge-border-medium)" rx="1" />';
        }

        // Latency Point
        const latY = padT + chartH - ((b.p50LatencyMs / maxLat) * chartH);
        polyPoints.push((x + barWidth / 2) + ',' + Math.max(padT, Math.min(padT + chartH, latY)));

        // X-axis label every 2 buckets
        if (i % 2 === 0) {
          svgHtml += '<text x="' + (x + barWidth / 2) + '" y="' + (h - 6) + '" font-size="9" fill="var(--forge-text-subtle)" text-anchor="middle" font-family="monospace">' + b.timeLabel + '</text>';
        }
      });

      // Latency Overlay Polyline
      if (polyPoints.length > 1) {
        svgHtml += '<polyline points="' + polyPoints.join(' ') + '" fill="none" stroke="var(--forge-primary)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />';
      }

      svgHtml += '</svg>';
      container.innerHTML = svgHtml;
    }

    async function loadTrafficRoutes() {
      try {
        const res = await fetch(apiBase + '/api/analytics/traffic/routes').then(r => r.json());
        const cont = document.getElementById('traffic-routes-table-container');
        if (!cont) return;

        if (!res.routes || !res.routes.length) {
          cont.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--forge-text-muted);">No endpoint route telemetry recorded yet.</div>';
          return;
        }

        cont.innerHTML = \`
          <table class="data-table">
            <thead>
              <tr>
                <th>Method</th>
                <th>Endpoint Route Path</th>
                <th>App Target</th>
                <th>Requests</th>
                <th>Avg Latency</th>
                <th>p99 Tail</th>
                <th>Error Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              \${res.routes.map(r => {
                const methodClass = 'method-' + r.method.toLowerCase();
                const tierClass = r.speedTier === 'FAST' ? 'badge-running' : (r.speedTier === 'NORMAL' ? 'astryx-micro-pill' : 'badge-degraded');
                return \`
                  <tr>
                    <td><span class="method-pill \${methodClass}">\${r.method}</span></td>
                    <td><code class="astryx-code-badge" style="font-size:0.75rem;">\${r.path}</code></td>
                    <td><span class="astryx-micro-pill">\${r.appId}</span></td>
                    <td><strong>\${r.totalRequests.toLocaleString()}</strong></td>
                    <td><span class="latency-pill \${r.avgDurationMs < 2 ? 'latency-fast' : 'latency-medium'}">\${r.avgDurationMs}ms</span></td>
                    <td><span style="font-family:monospace; font-size:0.75rem;">\${r.p99DurationMs}ms</span></td>
                    <td><span style="color:\${r.errorRatePct > 0 ? 'var(--forge-accent)' : 'var(--forge-success)'};">\${r.errorRatePct}%</span></td>
                    <td><span class="astryx-badge \${tierClass}">\${r.speedTier}</span></td>
                  </tr>
                \`;
              }).join('')}
            </tbody>
          </table>
        \`;
      } catch (err) {
        console.error('Failed to load traffic routes', err);
      }
    }

    async function loadTrafficEvents() {
      try {
        const res = await fetch(apiBase + '/api/analytics/traffic?limit=50').then(r => r.json());
        cachedTrafficEvents = res.events || [];
        renderFilteredTrafficEvents();
      } catch (err) {
        console.error('Failed to load traffic events', err);
      }
    }

    function onTrafficSearchChange(val) {
      trafficSearchFilter = (val || '').toLowerCase().trim();
      renderFilteredTrafficEvents();
    }

    function renderFilteredTrafficEvents() {
      const cont = document.getElementById('traffic-events-table-container');
      if (!cont) return;

      const filtered = cachedTrafficEvents.filter(e => {
        if (!trafficSearchFilter) return true;
        return (e.path || '').toLowerCase().includes(trafficSearchFilter) ||
          (e.app_id || '').toLowerCase().includes(trafficSearchFilter) ||
          (e.trace_id || '').toLowerCase().includes(trafficSearchFilter);
      });

      if (!filtered.length) {
        cont.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--forge-text-muted);">No matching traffic events found.</div>';
        return;
      }

      cont.innerHTML = \`
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Service</th>
              <th>Method</th>
              <th>Path</th>
              <th>Status</th>
              <th>Duration</th>
              <th>Trace ID</th>
            </tr>
          </thead>
          <tbody>
            \${filtered.map(e => {
              const methodClass = 'method-' + (e.method || 'get').toLowerCase();
              const statusClass = e.status_code < 300 ? 'status-2xx' : (e.status_code < 400 ? 'status-3xx' : (e.status_code < 500 ? 'status-4xx' : 'status-5xx'));
              const timeStr = new Date(e.timestamp * 1000).toLocaleTimeString();
              const traceTag = e.trace_id
                ? '<span class="log-trace-tag" onclick="filterByTraceId(\\'' + e.trace_id + '\\')" title="Inspect Trace">#' + e.trace_id.slice(0, 8) + '</span>'
                : '<span style="color:var(--forge-text-subtle);">--</span>';

              return \`
                <tr>
                  <td style="font-family:monospace; font-size:0.72rem; color:var(--forge-text-subtle);">\${timeStr}</td>
                  <td><span class="astryx-micro-pill">\${e.app_id || 'sys'}</span></td>
                  <td><span class="method-pill \${methodClass}">\${e.method || 'GET'}</span></td>
                  <td><code style="font-size:0.74rem;">\${e.path}</code></td>
                  <td><span class="\${statusClass}">\${e.status_code}</span></td>
                  <td><span class="latency-pill \${e.duration_ms < 5 ? 'latency-fast' : 'latency-medium'}">\${e.duration_ms}ms</span></td>
                  <td>\${traceTag}</td>
                </tr>
              \`;
            }).join('')}
          </tbody>
        </table>
      \`;
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
      if (window.showAstryxToast) window.showAstryxToast('info', '⚡ Executing ' + samples + '-sample benchmark on ' + target + '...');

      try {
        const res = await fetch(apiBase + '/api/benchmark', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ target, samples, concurrency }),
        }).then(r => r.json());

        if (scorecard && res.status === 'ok') {
          scorecard.innerHTML = \`
            <div class="benchmark-scorecard-grid">
              <div class="scorecard-item">
                <span class="scorecard-item-label">Target / Route</span>
                <span class="scorecard-item-val" style="font-size:0.85rem; color:var(--forge-primary);">\${res.target}</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">Median (p50)</span>
                <span class="scorecard-item-val" style="color:var(--forge-success);">\${res.p50Ms}ms</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">p90 Latency</span>
                <span class="scorecard-item-val">\${res.p90Ms}ms</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">Peak Tail (p99)</span>
                <span class="scorecard-item-val" style="color:\${res.p99Ms > 10 ? 'var(--forge-accent)' : 'var(--forge-text-main)'};">\${res.p99Ms}ms</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">Min / Max</span>
                <span class="scorecard-item-val" style="font-size:0.85rem;">\${res.minMs} / \${res.maxMs}ms</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">Throughput (RPS)</span>
                <span class="scorecard-item-val" style="color:var(--forge-primary);">\${res.reqPerSec} req/s</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">Std Deviation</span>
                <span class="scorecard-item-val" style="font-size:0.85rem;">±\${res.stdDevMs}ms</span>
              </div>
              <div class="scorecard-item">
                <span class="scorecard-item-label">SLO Verdict</span>
                <span class="astryx-badge \${res.targetMet ? 'badge-running' : 'badge-degraded'}" style="margin-top:0.2rem;">\${res.targetMet ? 'SLO TARGET MET (<2ms)' : 'LATENCY WARNING'}</span>
              </div>
            </div>
          \`;

          if (window.showAstryxToast) {
            window.showAstryxToast('success', '⚡ Benchmark Complete: p50 ' + res.p50Ms + 'ms | p99 ' + res.p99Ms + 'ms (' + res.reqPerSec + ' req/s)');
          }

          // Refresh traffic signals and routes to include the new measurements
          loadTrafficMetrics();
          loadTrafficRoutes();
          loadTrafficEvents();
        }
      } catch (err) {
        if (scorecard) scorecard.innerHTML = '<div style="color:var(--forge-accent); padding:0.5rem;">Benchmark request failed.</div>';
        if (window.showAstryxToast) window.showAstryxToast('error', 'Benchmark stress test failed');
      } finally {
        if (btn) {
          btn.disabled = false;
          btn.innerHTML = '⚡ Run Stress Test';
        }
      }
    }
  `;
}
