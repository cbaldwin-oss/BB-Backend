const Settings = {
    containerId: 'settings-container',
    currentCategory: 'Assets', // Default category

    init() {
        const container = document.getElementById(this.containerId);
        this.render(container);
    },

    render(container) {
        container.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px;">
                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05); grid-column: span 2;">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">📋 Dropdown Management</h3>
                    <p style="font-size: 13px; color: #666;">Add or remove options. (Only non-empty entries are shown).</p>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="font-size: 12px; font-weight: bold; display: block; margin-bottom: 5px;">Select Category:</label>
                        <select id="setting-category-select" onchange="Settings.switchCategory(this.value)" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                            <option value="Times">Times</option>
                            <option value="Places">Places</option>
                            <option value="Activities">Activities</option>
                            <option value="Assets">Assets</option>
                            <option value="Trade_Partners">Trade Partners</option>
                            <option value="Results">Results</option>
                        </select>
                    </div>

                    <div id="dropdown-list-container" style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; border-radius: 4px; padding: 10px; background: #fafafa; position: relative;">
                        </div>

                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <input type="text" id="new-option-input" placeholder="Enter new option..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <button id="add-opt-btn" onclick="Settings.addOption(this)" style="background: #2e7d32; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Add</button>
                    </div>
                </div>

                <div style="background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <h3 style="margin-top:0; font-size:16px; color:#333;">🧹 Database Maintenance</h3>
                    <p style="font-size: 13px; color: #666;">Cleanup empty rows and refresh the status system.</p>
                    <button onclick="Settings.cleanupEmptyRows(this)" style="background: #616161; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; width: 100%; margin-bottom: 10px;">Delete Empty DB Rows</button>
                    <button onclick="triggerFullStatusRefresh()" style="background: #01579b; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; width: 100%;">Run 7-Day Status Refresh</button>
                </div>
            </div>
        `;
        // Sync the select value with current state
        document.getElementById('setting-category-select').value = this.currentCategory;
        this.loadCategoryData();
    },

    switchCategory(val) {
        this.currentCategory = val;
        this.loadCategoryData();
    },

    loadCategoryData() {
        const container = document.getElementById('dropdown-list-container');
        const mapping = { 'Times': 'col1', 'Places': 'col2', 'Activities': 'col3', 'Assets': 'col4', 'Trade_Partners': 'col6', 'Results': 'col7' };
        const dataKey = mapping[this.currentCategory];
        const options = window.dropdownData[dataKey] || [];

        if (options.length === 0) {
            container.innerHTML = '<p style="color:#999; font-size:12px; text-align:center; padding: 20px;">No options found. Add one below!</p>';
            return;
        }

        container.innerHTML = options.map(opt => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 5px; border-bottom:1px solid #eee;">
                <span style="font-size:13px;">${opt}</span>
                <button onclick="Settings.deleteOption('${opt.replace(/'/g, "\\'")}')" style="background:none; border:none; color:#d32f2f; cursor:pointer; font-size:18px; line-height:1;">&times;</button>
            </div>
        `).join('');
    },

    async addOption(btn) {
        const input = document.getElementById('new-option-input');
        const val = input.value.trim();
        if (!val) return;

        btn.disabled = true;
        btn.innerText = "Saving...";

        const insertData = {};
        insertData[this.currentCategory] = val;

        const { error } = await _supabase.from('dropdownoptions').insert([insertData]);

        if (error) {
            alert("Error adding: " + error.message);
        } else {
            input.value = "";
            await this.refreshAppData();
        }
        btn.disabled = false;
        btn.innerText = "Add";
    },

    async deleteOption(val) {
        if (!confirm(`Delete "${val}" from ${this.currentCategory}?`)) return;
        const updateData = {};
        updateData[this.currentCategory] = null;

        const { error } = await _supabase
            .from('dropdownoptions')
            .update(updateData)
            .eq(this.currentCategory, val);

        if (error) alert("Error: " + error.message);
        else await this.refreshAppData();
    },

    async cleanupEmptyRows(btn) {
        btn.disabled = true;
        btn.innerText = "Cleaning...";
        // Deletes rows where ALL columns are null
        const { error } = await _supabase
            .from('dropdownoptions')
            .delete()
            .is('Times', null).is('Places', null).is('Activities', null)
            .is('Assets', null).is('Trade_Partners', null).is('Results', null);
        
        alert(error ? "Error: " + error.message : "Database cleaned of empty rows!");
        btn.disabled = false;
        btn.innerText = "Delete Empty DB Rows";
    },

    async refreshAppData() {
        await fetchDropdownOptions();
        if (typeof refreshDropdowns === 'function') refreshDropdowns();
        this.loadCategoryData(); 
    }
};