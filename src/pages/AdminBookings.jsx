import React, { useState, useEffect } from 'react';
import { getBookings, updateBookingStatus, deleteBooking } from '../api';

const eventTypeLabels = {
  wedding: 'Свадьба',
  cumetrie: 'Кумэтрия',
  birthday: 'День рождения',
  corporate: 'Корпоратив',
  banquet: 'Банкет',
  other: 'Другое',
};

const hallLabels = {
  sala1: 'Sala 1 (до 15)',
  sala2: 'Sala 2 (до 25)',
  restaurant: 'Ресторан à la carte',
  terasa: 'Терраса',
  foisor: 'Фоишор',
};

const statusLabels = {
  new: 'Новая',
  confirmed: 'Подтверждена',
  cancelled: 'Отменена',
};

const statusBadge = {
  new: 'badge-gold',
  confirmed: 'badge-green',
  cancelled: 'badge-red',
};

export default function AdminBookings() {
  const [items, setItems] = useState([]);

  const load = () => getBookings().then(setItems);
  useEffect(() => { load(); }, []);

  const handleStatus = async (id, status) => {
    await updateBookingStatus(id, status);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить бронь?')) return;
    await deleteBooking(id);
    load();
  };

  const formatDate = (d) => {
    return new Date(d).toLocaleString('ru-RU', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const formatEventDate = (d) => {
    return new Date(d + 'T00:00:00').toLocaleDateString('ru-RU', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  return (
    <div>
      <h1 className="admin-page-title">Бронирование залов</h1>
      <p style={{ color: '#6B6B6B', fontSize: '0.9rem', marginBottom: '20px' }}>
        {items.length} заявок, {items.filter(i => i.status === 'new').length} новых
      </p>

      {items.map(item => (
        <div key={item.id} className={`feedback-card ${item.status !== 'new' ? 'read' : ''}`}>
          <div className="feedback-card-header">
            <div>
              <div className="feedback-card-name">
                {item.name}
                <span className={`badge ${statusBadge[item.status]}`} style={{ marginLeft: '8px' }}>
                  {statusLabels[item.status]}
                </span>
              </div>
              <div className="feedback-card-contact">
                <span>{item.phone}</span>
              </div>
            </div>
            <div className="feedback-card-date">{formatDate(item.created_at)}</div>
          </div>
          <div className="feedback-card-message">
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '8px' }}>
              <span><strong>Дата:</strong> {formatEventDate(item.date)}</span>
              {item.guests && <span><strong>Гостей:</strong> {item.guests}</span>}
              {item.event_type && <span><strong>Тип:</strong> {eventTypeLabels[item.event_type] || item.event_type}</span>}
              {item.hall && <span><strong>Зал:</strong> {hallLabels[item.hall] || item.hall}</span>}
            </div>
            {item.message && <p>{item.message}</p>}
          </div>
          <div className="feedback-card-actions">
            {item.status === 'new' && (
              <button className="btn-sm" onClick={() => handleStatus(item.id, 'confirmed')}>Подтвердить</button>
            )}
            {item.status !== 'cancelled' && (
              <button className="btn-sm" onClick={() => handleStatus(item.id, 'cancelled')}>Отменить</button>
            )}
            <button className="btn-sm danger" onClick={() => handleDelete(item.id)}>Удалить</button>
          </div>
        </div>
      ))}

      {items.length === 0 && (
        <div className="empty-state">
          <div className="icon">&#127878;</div>
          <p>Нет заявок на бронирование</p>
        </div>
      )}
    </div>
  );
}
