import React, { useState, useEffect } from 'react';
import { getFeedback, markFeedbackRead, deleteFeedback } from '../api';

export default function AdminFeedback() {
  const [items, setItems] = useState([]);

  const load = () => getFeedback().then(setItems);
  useEffect(() => { load(); }, []);

  const handleRead = async (id) => {
    await markFeedbackRead(id);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить сообщение?')) return;
    await deleteFeedback(id);
    load();
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div>
      <h1 className="admin-page-title">Обратная связь</h1>
      <p style={{ color: '#6B6B6B', fontSize: '0.9rem', marginBottom: '20px' }}>
        {items.length} сообщений, {items.filter(i => !i.is_read).length} непрочитанных
      </p>

      {items.map(item => (
        <div key={item.id} className={`feedback-card ${item.is_read ? 'read' : ''}`}>
          <div className="feedback-card-header">
            <div>
              <div className="feedback-card-name">
                {item.name}
                {!item.is_read && <span className="badge badge-gold" style={{ marginLeft: '8px' }}>Новое</span>}
              </div>
              <div className="feedback-card-contact">
                {item.phone && <span>{item.phone}</span>}
                {item.phone && item.email && <span> &middot; </span>}
                {item.email && <span>{item.email}</span>}
              </div>
            </div>
            <div className="feedback-card-date">{formatDate(item.created_at)}</div>
          </div>
          <div className="feedback-card-message">{item.message}</div>
          <div className="feedback-card-actions">
            {!item.is_read && (
              <button className="btn-sm" onClick={() => handleRead(item.id)}>Прочитано</button>
            )}
            <button className="btn-sm danger" onClick={() => handleDelete(item.id)}>Удалить</button>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="empty-state">
          <div className="icon">&#128172;</div>
          <p>Нет сообщений</p>
        </div>
      )}
    </div>
  );
}
