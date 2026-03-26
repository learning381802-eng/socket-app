import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Edit, Trash2, X, Check, Palette } from 'lucide-react'
import { useMathStore, MathCategory } from './mathStore'

const CATEGORY_COLORS = [
  '#2d6a4f', '#185fa5', '#9b2226', '#6b3fa0',
  '#b5761a', '#00897b', '#c5221f', '#7b1fa2',
  '#f57c00', '#0277bd', '#2e7d32', '#c62828',
]

const CATEGORY_ICONS = ['x²', '△', '∫', 'Θ', '∑', '√', 'π', '∞', '≠', '≈', '∈', '∴']

export default function CategoriesManager() {
  const { customCategories, addCategory, editCategory, deleteCategory, getAllCategories } = useMathStore()
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: CATEGORY_COLORS[0],
    icon: CATEGORY_ICONS[0],
  })

  const allCategories = getAllCategories()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    if (editingId) {
      editCategory(editingId, formData)
      setEditingId(null)
    } else {
      addCategory(formData)
    }

    setFormData({ name: '', description: '', color: CATEGORY_COLORS[0], icon: CATEGORY_ICONS[0] })
    setIsAdding(false)
  }

  const handleEdit = (cat: MathCategory) => {
    setEditingId(cat.id)
    setFormData({
      name: cat.name,
      description: cat.description,
      color: cat.color,
      icon: cat.icon,
    })
    setIsAdding(true)
  }

  const handleCancel = () => {
    setIsAdding(false)
    setEditingId(null)
    setFormData({ name: '', description: '', color: CATEGORY_COLORS[0], icon: CATEGORY_ICONS[0] })
  }

  return (
    <div className="categories-manager">
      <div className="categories-header">
        <h3 className="categories-title">Categories</h3>
        <button onClick={() => setIsAdding(!isAdding)} className="categories-add-btn">
          <Plus size={16} />
          <span>{isAdding ? 'Cancel' : 'Add Category'}</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleSubmit}
            className="category-form"
          >
            <div className="form-row">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Category name"
                className="category-input"
                required
              />
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description"
                className="category-input"
              />
            </div>

            <div className="form-row">
              <div className="color-picker">
                <label className="color-label">Color:</label>
                <div className="color-options">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`color-option ${formData.color === color ? 'active' : ''}`}
                      style={{ background: color }}
                    >
                      {formData.color === color && <Check size={12} color="white" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="icon-picker">
                <label className="icon-label">Icon:</label>
                <div className="icon-options">
                  {CATEGORY_ICONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`icon-option ${formData.icon === icon ? 'active' : ''}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="category-submit-btn">
                <Check size={16} />
                <span>{editingId ? 'Update' : 'Add'} Category</span>
              </button>
              <button type="button" onClick={handleCancel} className="category-cancel-btn">
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="categories-grid">
        {allCategories.map((cat) => {
          const isCustom = customCategories.find(c => c.id === cat.id)
          const isEditing = editingId === cat.id

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`category-card ${isEditing ? 'editing' : ''}`}
              style={{ borderColor: cat.color }}
            >
              <div className="category-card-header">
                <div
                  className="category-icon"
                  style={{ background: `${cat.color}20`, color: cat.color }}
                >
                  {cat.icon}
                </div>
                {isCustom && (
                  <div className="category-actions">
                    <button onClick={() => handleEdit(cat)} className="category-action-btn">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => deleteCategory(cat.id)} className="category-action-btn delete">
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}
              </div>

              <h4 className="category-card-name">{cat.name}</h4>
              <p className="category-card-desc">{cat.description}</p>

              {isEditing && (
                <div className="editing-form">
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="editing-input"
                  />
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="editing-input"
                  />
                  <div className="editing-colors">
                    {CATEGORY_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, color })
                          editCategory(cat.id, { color })
                        }}
                        className={`color-option ${formData.color === color ? 'active' : ''}`}
                        style={{ background: color }}
                      >
                        {formData.color === color && <Check size={10} color="white" />}
                      </button>
                    ))}
                  </div>
                  <div className="editing-actions">
                    <button onClick={() => setEditingId(null)} className="editing-save-btn">
                      <Check size={14} />
                      <span>Done</span>
                    </button>
                  </div>
                </div>
              )}

              {!isEditing && (
                <div className="category-card-footer">
                  <span className="category-problem-count">
                    {cat.problemCount} problems
                  </span>
                  {!isCustom && (
                    <span className="category-badge">Default</span>
                  )}
                </div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
