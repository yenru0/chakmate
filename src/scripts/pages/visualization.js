document.addEventListener('DOMContentLoaded', () => {
    // Sample file data
    const folderContents = {
      'work-projects/2024-reports': [
        { name: 'Q4_Report_2024.pdf', size: '2.4 MB', type: 'pdf' },
        { name: 'Annual_Review.pptx', size: '8.1 MB', type: 'pptx' },
        { name: 'Budget_Analysis.xlsx', size: '1.2 MB', type: 'xlsx' }
      ],
      'work-projects/client-files': [
        { name: 'Acme_Corp_Contract.pdf', size: '540 KB', type: 'pdf' },
        { name: 'Client_Feedback.docx', size: '234 KB', type: 'docx' },
        { name: 'Project_Proposal.pptx', size: '4.5 MB', type: 'pptx' },
        { name: 'Invoice_2024.xlsx', size: '89 KB', type: 'xlsx' }
      ],
      'work-projects/archive': [
        { name: '2023_Reports.zip', size: '15.2 MB', type: 'zip' },
        { name: 'Old_Contracts.pdf', size: '3.1 MB', type: 'pdf' }
      ],
      'personal/photos': [
        { name: 'Vacation_2024.jpg', size: '4.2 MB', type: 'jpg' },
        { name: 'Family_Gathering.png', size: '2.8 MB', type: 'png' },
        { name: 'Screenshots.zip', size: '12.4 MB', type: 'zip' }
      ],
      'personal/downloads-archive': [
        { name: 'Software_Installers.zip', size: '245 MB', type: 'zip' },
        { name: 'Ebooks_Collection.pdf', size: '34 MB', type: 'pdf' }
      ],
      'utilities/temp-files': [
        { name: 'export_data.csv', size: '1.4 MB', type: 'csv' },
        { name: 'debug_log.txt', size: '234 KB', type: 'txt' }
      ]
    };

    // State
    let selectedFolders = new Set(['work-projects', '2024-reports', 'client-files']);
    let appliedFolders = new Set();
    const totalFolders = 7;

    // DOM Elements
    const folderTree = document.getElementById('folderTree');
    const previewContent = document.getElementById('previewContent');
    const previewPath = document.getElementById('previewPath');
    const selectedCount = document.getElementById('selectedCount');
    const applyBtn = document.getElementById('applyBtn');
    const applyCount = document.getElementById('applyCount');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const progressPercent = document.getElementById('progressPercent');
    const successOverlay = document.getElementById('successOverlay');
    const successSubtitle = document.getElementById('successSubtitle');

    // File icon SVG by type
    const fileIcons = {
      pdf: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
      pptx: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff9f43" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
      xlsx: '<svg viewBox="0 0 24 24" fill="none" stroke="#26de81" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>',
      docx: '<svg viewBox="0 0 24 24" fill="none" stroke="#4f8cff" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>',
      jpg: '<svg viewBox="0 0 24 24" fill="none" stroke="#a55eea" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      png: '<svg viewBox="0 0 24 24" fill="none" stroke="#a55eea" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>',
      zip: '<svg viewBox="0 0 24 24" fill="none" stroke="#778ca3" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
      csv: '<svg viewBox="0 0 24 24" fill="none" stroke="#20bf6b" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="16" y2="17"/></svg>',
      txt: '<svg viewBox="0 0 24 24" fill="none" stroke="#95a5a6" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>'
    };

    // Toggle tree item expansion
    folderTree.addEventListener('click', (e) => {
      const header = e.target.closest('.tree-item-header');
      if (header && !e.target.closest('.checkbox-wrapper')) {
        const item = header.closest('.tree-item');
        item.classList.toggle('expanded');
      }
    });

    // Handle checkbox changes
    folderTree.addEventListener('change', (e) => {
      if (e.target.classList.contains('checkbox-input')) {
        const checkbox = e.target;
        const folder = checkbox.dataset.folder;
        const subfolder = checkbox.dataset.subfolder;
        const type = checkbox.dataset.type;

        if (type === 'folder') {
          // Toggle all subfolders
          const parentItem = checkbox.closest('.tree-item');
          const subCheckboxes = parentItem.querySelectorAll('.child-item .checkbox-input');
          subCheckboxes.forEach(cb => {
            cb.checked = checkbox.checked;
            const sub = cb.dataset.subfolder;
            if (checkbox.checked) {
              selectedFolders.add(sub);
            } else {
              selectedFolders.delete(sub);
            }
          });
        }

        if (checkbox.checked) {
          selectedFolders.add(subfolder || folder);
        } else {
          selectedFolders.delete(subfolder || folder);
        }

        updateUI();
      }
    });

    // Preview on child item click
    folderTree.addEventListener('click', (e) => {
      const childItem = e.target.closest('.child-item');
      if (childItem && !e.target.closest('.checkbox-wrapper')) {
        const previewKey = childItem.dataset.preview;
        showPreview(previewKey);
      }
    });

    // Show preview
    function showPreview(key) {
      const files = folderContents[key];
      previewPath.textContent = key;

      if (!files || files.length === 0) {
        previewContent.innerHTML = `
          <div class="preview-empty">
            <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><use href="#icon-folder"></use></svg>
            <p>이 폴더는 비어 있습니다</p>
          </div>
        `;
        return;
      }

      const filesHtml = files.map(file => `
        <div class="preview-file ${appliedFolders.has(key) ? 'applied' : ''}">
          <div class="file-icon">${fileIcons[file.type] || fileIcons.txt}</div>
          <div class="file-info">
            <div class="file-name">${file.name}</div>
            <div class="file-meta">${file.size} · ${file.type.toUpperCase()}</div>
          </div>
        </div>
      `).join('');

      previewContent.innerHTML = filesHtml;
    }

    function updateUI() {
      const count = selectedFolders.size;
      selectedCount.textContent = `${count} of ${totalFolders} selected`;
      applyCount.textContent = count;
      applyBtn.disabled = count === 0;

      const appliedCount = appliedFolders.size;
      const percent = Math.round((appliedCount / totalFolders) * 100);
      progressFill.style.width = `${percent}%`;
      progressText.textContent = `${appliedCount} of ${totalFolders} folders applied`;
      progressPercent.textContent = `${percent}%`;
    }

    // Apply selected folders
    applyBtn.addEventListener('click', () => {
      selectedFolders.forEach(f => appliedFolders.add(f));

      // Show success
      successSubtitle.textContent = `${selectedFolders.size} folders have been organized`;
      successOverlay.classList.add('visible');

      // Hide after delay
      setTimeout(() => {
        successOverlay.classList.remove('visible');
      }, 2000);

      // Clear selection
      selectedFolders.clear();

      // Update all checkboxes
      document.querySelectorAll('.checkbox-input').forEach(cb => {
        cb.checked = false;
      });

      updateUI();
    });

    // Back button
    document.querySelector('.back-btn').addEventListener('click', () => {
      // In a real app, this would navigate back
      console.log('Back clicked');
    });

    // Initialize
    updateUI();
});