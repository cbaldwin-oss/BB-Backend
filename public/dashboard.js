// Inside dashboard.js
const Dashboard = {
    async init() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '<p style="padding:20px;">Gathering data from all systems...</p>';

        try {
            // 1. Fetch Supabase Data
            const { data: scheduleData } = await _supabase.from('BackEndData').select('*');

            // 2. Fetch External Google Sheets Data
            const externalUrl = `${GOOGLE_SCRIPT_URL}?action=getExternalDashboardData`;
            const response = await fetch(externalUrl);
            const externalData = await response.json();

            // 3. Fetch Recent History
            const { data: historyData } = await _supabase
                .from('edit_history')
                .select('*')
                .order('changed_at', { ascending: false })
                .limit(5);

            this.render(scheduleData, externalData, historyData);
        } catch (err) {
            container.innerHTML = `<p style="color:red; padding:20px;">Sync Error: ${err.message}</p>`;
        }
    },

    render(data, external, history) {
        const stats = this.calculateStats(data);
        const container = document.getElementById(this.containerId);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                ${this.createStatCard("Active Jobs", stats.total, "#01579b")}
                ${this.createStatCard("Verified", stats.verified, "#2e7d32")}
                
                ${this.createStatCard("Fleet Units", external.Fleet ? external.Fleet.count : 0, "#5e35b1")}
                
                ${this.createStatCard("Inventory Alerts", external.Inventory ? external.Inventory.summary : 0, "#d32f2f")}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background:white; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h4>External System Status</h4>
                    ${this.renderExternalBreakdown(external)}
                </div>
                <div style="background:white; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h4>Recent Audit Log</h4>
                    ${this.renderHistoryList(history)}
                </div>
            </div>
        `;
    },

    renderExternalBreakdown(external) {
        return Object.entries(external).map(([name, data]) => `
            <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
                <span style="font-weight:bold;">${name}</span>
                <span>${data.count} entries | <small>${data.summary}</small></span>
            </div>
        `).join('');
    }
};