import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X, Search, Bot, Calendar, FileText, Github, Trello,
  Zap, Star, Clock, ExternalLink, Plus, Settings, Trash2
} from 'lucide-react'
import { useStore } from '../../store'

const AVAILABLE_BOTS = [
  { id: 'drive', name: 'Google Drive', description: 'Share and collaborate on files', icon: FileText, category: 'Productivity', installed: true },
  { id: 'calendar', name: 'Google Calendar', description: 'Schedule meetings and events', icon: Calendar, category: 'Productivity', installed: true },
  { id: 'github', name: 'GitHub', description: 'Get notified about PRs and issues', icon: Github, category: 'Development', installed: false },
  { id: 'trello', name: 'Trello', description: 'Manage your boards and cards', icon: Trello, category: 'Productivity', installed: false },
  { id: 'zapier', name: 'Zapier', description: 'Automate workflows', icon: Zap, category: 'Automation', installed: false },
  { id: 'polls', name: 'Polls', description: 'Create quick polls for your team', icon: Star, category: 'Fun', installed: false },
]

const INSTALLED_BOTS = AVAILABLE_BOTS.filter(b => b.installed)

export default function AppsPanel() {
  const { setModal, setRightPanelOpen } = useStore()
  const [activeTab, setActiveTab] = useState('installed') // installed, browse
  const [searchQuery, setSearchQuery] = useState('')

  const filteredBots = AVAILABLE_BOTS.filter((bot) =>
    bot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    bot.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const displayedBots = activeTab === 'installed'
    ? filteredBots.filter(b => b.installed)
    : filteredBots.filter(b => !b.installed)

  return (
    <div className="apps-panel-backdrop" onClick={() => setRightPanelOpen(false)}>
      <motion.div
        className="apps-panel"
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="apps-panel-header">
          <div>
            <h2 className="apps-panel-title">Apps & Bots</h2>
            <p className="apps-panel-subtitle">Extend your chat experience</p>
          </div>
          <button onClick={() => setRightPanelOpen(false)} className="apps-panel-close">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="apps-search">
          <Search size={18} className="apps-search-icon" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search apps..."
            className="apps-search-input"
          />
        </div>

        {/* Tabs */}
        <div className="apps-tabs">
          <button
            onClick={() => setActiveTab('installed')}
            className={`apps-tab ${activeTab === 'installed' ? 'active' : ''}`}
          >
            <Star size={16} />
            <span>Installed</span>
            <span className="apps-tab-count">{INSTALLED_BOTS.length}</span>
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className={`apps-tab ${activeTab === 'browse' ? 'active' : ''}`}
          >
            <Plus size={16} />
            <span>Browse</span>
          </button>
        </div>

        {/* Apps List */}
        <div className="apps-list">
          {displayedBots.map((bot) => {
            const Icon = bot.icon
            return (
              <div key={bot.id} className="app-item">
                <div className="app-icon">
                  <Icon size={24} />
                </div>
                <div className="app-content">
                  <div className="app-header">
                    <h3 className="app-name">{bot.name}</h3>
                    <span className="app-category">{bot.category}</span>
                  </div>
                  <p className="app-description">{bot.description}</p>
                  <div className="app-actions">
                    {bot.installed ? (
                      <>
                        <button className="app-action-btn">
                          <Settings size={14} />
                          <span>Configure</span>
                        </button>
                        <button className="app-action-btn danger">
                          <Trash2 size={14} />
                        </button>
                      </>
                    ) : (
                      <button className="app-action-btn primary">
                        <Plus size={14} />
                        <span>Add to Chat</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {displayedBots.length === 0 && (
          <div className="apps-empty">
            <Bot size={48} className="apps-empty-icon" />
            <h3>No apps found</h3>
            <p>
              {activeTab === 'installed'
                ? 'Install apps from the Browse tab'
                : 'Try adjusting your search'}
            </p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="apps-quick-actions">
          <h4 className="apps-quick-actions-title">Quick Actions</h4>
          <div className="apps-quick-actions-grid">
            <button className="quick-action-btn">
              <Calendar size={18} />
              <span>Schedule</span>
            </button>
            <button className="quick-action-btn">
              <FileText size={18} />
              <span>Share File</span>
            </button>
            <button className="quick-action-btn">
              <Zap size={18} />
              <span>Automate</span>
            </button>
            <button className="quick-action-btn">
              <ExternalLink size={18} />
              <span>More</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
