import React, { useState, useEffect } from 'react';
import { getCategories, getItems, createItem, updateItem, deleteItem } from '../api';

export default function AdminItems() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [filterCat, setFilterCat] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({
    category_id: '', name: '', name_ru: '', description: '', description_ru: '',
    price: '', weight: '', available: 1, sort_order: 0
  });
  const [imageFile, setImageFile] = useState(null);

  const load = async () => {
    const [cats, itms] = await Promise.all([getCategories(), getItems()]);
    setCategories(cats);
    setItems(itms);
  };

  useEffect(() => { load(); }, []);

  const filtered = filterCat ? items.filter(i => i.category_id === Number(filterCat)) : items;

  const catName = (id) => {
    const c = categories.find(c => c.id === id);
    return c ? (c.name_ru || c.name) : '—';
  };

  const openCreate = () => {
    setForm({
      category_id: categories[0]?.id || '', name: '', name_ru: '', description: '', description_ru: '',
      price: '', weight: '', available: 1, sort_order: 0
    });
    setImageFile(null);
    setModal('create');
  };

  const openEdit = (item) => {
    setForm({
      category_id: item.category_id, name: item.name, name_ru: item.name_ru || '',
      description: item.description || '', description_ru: item.description_ru || '',
      price: item.price, weight: item.weight || '', available: item.available, sort_order: item.sort_order || 0
    });
    setImageFile(null);
    setModal(item);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (imageFile) fd.append('image', imageFile);

    if (modal === 'create') {
      await createItem(fd);
    } else {
      await updateItem(modal.id, fd);
    }
    setModal(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить позицию?')) return;
    await deleteItem(id);
    load();
  };

  return (
    <div>
      <h1 className="admin-page-title">Позиции меню</h1>

      <div className="admin-toolbar">
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <select className="form-input" style={{ width: 'auto' }} value={filterCat} onChange={e => setFilterCat(e.target.value)}>
            <option value="">Все категории</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name_ru || c.name}</option>)}
          </select>
          <span style={{ color: '#6B6B6B', fontSize: '0.9rem' }}>{filtered.length} позиций</span>
        </div>
        <button className="btn-add" onClick={openCreate}>+ Добавить</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Фото</th>
            <th>Название</th>
            <th>Категория</th>
            <th>Цена</th>
            <th>Вес</th>
            <th>Статус</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => (
            <tr key={item.id}>
              <td>
                {item.image ? (
                  <img className="thumb" src={`/uploads/${item.image}`} alt="" />
                ) : (
                  <div className="thumb" style={{ background: '#FAF8F5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc' }}>—</div>
                )}
              </td>
              <td>
                <strong>{item.name_ru || item.name}</strong>
                {item.name_ru && <div style={{ fontSize: '0.8rem', color: '#999' }}>{item.name}</div>}
              </td>
              <td>{catName(item.category_id)}</td>
              <td><strong>{item.price} MDL</strong></td>
              <td>{item.weight || '—'}</td>
              <td>
                <span className={`badge ${item.available ? 'badge-green' : 'badge-red'}`}>
                  {item.available ? 'Активно' : 'Скрыто'}
                </span>
              </td>
              <td>
                <div className="actions">
                  <button className="btn-sm" onClick={() => openEdit(item)}>Изменить</button>
                  <button className="btn-sm danger" onClick={() => handleDelete(item.id)}>Удалить</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <div className="empty-state">
          <div className="icon">&#127860;</div>
          <p>Нет позиций. Добавьте первую!</p>
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{modal === 'create' ? 'Новая позиция' : 'Редактировать позицию'}</h2>
            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Категория *</label>
                <select className="form-input" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_ru || c.name}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Название (RO) *</label>
                  <input className="form-input" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Название (RU)</label>
                  <input className="form-input" value={form.name_ru} onChange={e => setForm({ ...form, name_ru: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Описание (RO)</label>
                <textarea className="form-textarea" style={{ minHeight: '60px' }} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Описание (RU)</label>
                <textarea className="form-textarea" style={{ minHeight: '60px' }} value={form.description_ru} onChange={e => setForm({ ...form, description_ru: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Цена (MDL) *</label>
                  <input className="form-input" type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Вес / Объём</label>
                  <input className="form-input" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} placeholder="300g / 500ml" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Порядок</label>
                  <input className="form-input" type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Доступность</label>
                  <select className="form-input" value={form.available} onChange={e => setForm({ ...form, available: Number(e.target.value) })}>
                    <option value={1}>Активно</option>
                    <option value={0}>Скрыто</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Фото</label>
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
