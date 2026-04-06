import React, { useState, useEffect } from 'react';
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null); // null | 'create' | category object
  const [form, setForm] = useState({ name: '', name_ru: '', sort_order: 0 });
  const [imageFile, setImageFile] = useState(null);

  const load = () => getCategories().then(setCategories);
  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setForm({ name: '', name_ru: '', sort_order: 0 });
    setImageFile(null);
    setModal('create');
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, name_ru: cat.name_ru || '', sort_order: cat.sort_order || 0 });
    setImageFile(null);
    setModal(cat);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('name_ru', form.name_ru);
    fd.append('sort_order', form.sort_order);
    if (imageFile) fd.append('image', imageFile);

    if (modal === 'create') {
      await createCategory(fd);
    } else {
      await updateCategory(modal.id, fd);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить категорию и все её позиции?')) return;
    await deleteCategory(id);
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title">Категории</h1>

      <div className="admin-toolbar">
        <span style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>{categories.length} категорий</span>
        <button className="btn-add" onClick={openCreate}>+ Добавить</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Название (RO)</th>
            <th>Название (RU)</th>
            <th>Порядок</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {categories.map(cat => (
            <tr key={cat.id}>
              <td>
                {cat.image ? (
                  <img className="thumb" src={`/uploads/${cat.image}`} alt="" />
                ) : (
                  <div className="thumb" style={{ background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>—</div>
                )}
              </td>
              <td>{cat.name}</td>
              <td>{cat.name_ru || '—'}</td>
              <td>{cat.sort_order}</td>
              <td>
                <div className="actions">
                  <button className="btn-sm" onClick={() => openEdit(cat)}>Изменить</button>
                  <button className="btn-sm danger" onClick={() => handleDelete(cat.id)}>Удалить</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {categories.length === 0 && (
        <div className="empty-state">
          <div className="icon">&#128203;</div>
          <p>Нет категорий. Добавьте первую!</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'Новая категория' : 'Редактировать категорию'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название (RO) *</label>
                <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Название (RU)</label>
                <input className="form-input" value={form.name_ru} onChange={e => setForm({ ...form, name_ru: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Порядок сортировки</label>
                <input className="form-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Изображение</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} />
                {modal !== 'create' && modal.image && !imageFile && (
                  <img className="img-preview" src={`/uploads/${modal.image}`} alt="" />
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-cancel" onClick={() => setModal(null)}>Отмена</button>
                <button type="submit" className="btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
