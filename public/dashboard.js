const Dashboard = {
    // 1. Configuration
    containerId: 'dash-content',

    // 2. Initialize and Fetch Data
    async init() {
        const container = document.getElementById(this.containerId);
        container.innerHTML = '<p style="padding:20px;">Analyzing schedule data...</p>';

        try {
            // Fetch all active records for the dashboard
            const { data: scheduleData, error: schedError } = await _supabase
                .from('BackEndData')
                .select('*');

            // Fetch recent history
            const { data: historyData, error: histError } = await _supabase
                .from('edit_history')
                .select('*')
                .order('changed_at', { ascending: false })
                .limit(10);

            if (schedError || histError) throw new Error("Failed to load dashboard data");

            this.render(scheduleData, historyData);
        } catch (err) {
            container.innerHTML = `<p style="color:red; padding:20px;">Error: ${err.message}</p>`;
        }
    },

    // 3. Render the Dashboard
    render(data, history) {
        const stats = this.calculateStats(data);
        const container = document.getElementById(this.containerId);

        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px;">
                ${this.createStatCard("Total Active Jobs", stats.total, "#01579b")}
                ${this.createStatCard("Lookups Verified", stats.verified, "#2e7d32")}
                ${this.createStatCard("Action Required (NA)", stats.na, "#d32f2f")}
                ${this.createStatCard("Pending Sync", stats.pending, "#f57f17")}
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div style="background:white; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h4 style="margin-top:0;">Top Activities</h4>
                    ${this.renderActivityList(stats.activities)}
                </div>

                <div style="background:white; padding:20px; border:1px solid #ddd; border-radius:8px;">
                    <h4 style="margin-top:0;">Recent Edit History</h4>
                    ${this.renderHistoryList(history)}
                </div>
            </div>
        `;
    },

    // 4. Helper Logic
    calculateStats(data) {
        const stats = { total: data.length, verified: 0, na: 0, pending: 0, activities: {} };
        
        data.forEach(row => {
            const status = (row.col5 || "").toLowerCase();
            if (status.includes('na')) stats.na++;
            else if (status.includes('checking') || status === '...') stats.pending++;
            else if (status !== "") stats.verified++;

            const activity = row.col4 || "Unassigned";
            stats.activities[activity] = (stats.activities[activity] || 0) + 1;
        });

        return stats;
    },

    createStatCard(title, value, color) {
        return `
            <div style="background:white; padding:20px; border-radius:8px; border-left: 5px solid ${color}; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                <div style="font-size:12px; color:#666; text-transform:uppercase; font-weight:bold;">${title}</div>
                <div style="font-size:28px; font-weight:bold; color:#333;">${value}</div>
            </div>
        `;
    },

    renderActivityList(activities) {
        const sorted = Object.entries(activities).sort((a,b) => b[1] - a[1]).slice(0, 5);
        return sorted.map(([name, count]) => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #f9f9f9;">
                <span>${name}</span>
                <span style="font-weight:bold; background:#e8f5e9; padding:2px 8px; border-radius:10px; font-size:12px;">${count}</span>
            </div>
        `).join('');
    },

    renderHistoryList(history) {
        return history.map(h => `
            <div style="font-size:11px; margin-bottom:10px; border-bottom:1px solid #f5f5f5; padding-bottom:5px;">
                <strong>${h.changed_by.split('@')[0]}</strong> changed row ${h.row_id} 
                <div style="color:#666;">${h.old_value || 'empty'} ➔ ${h.new_value}</div>
            </div>
        `).join('');
    }
};