import React, { useState, useEffect } from 'react';
import { getStats } from '../api';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats().then(setStats);
  }, []);

  if (!stats) return <p>Загрузка...</p>;

  return (
    <div>
      <h1 className="admin-page-title">Обзор</h1>
      <div className="stats-grid">
        <div className="stat-card">
          <div className="label">Категории</div>
          <div className="value">{stats.categories}</div>
        </div>
        <div className="stat-card">
          <div className="label">Позиции меню</div>
          <div className="value">{stats.items}</div>
        </div>
        <div className="stat-card">
          <div className="label">Сообщения</div>
          <div className="value">{stats.feedback}</div>
        </div>
        <div className="stat-card">
          <div className="label">Непрочитанные</div>
          <div className="value">{stats.unread}</div>
        </div>
        <div className="stat-card">
          <div className="label">Бронирование</div>
          <div className="value">{stats.bookings}</div>
        </div>
        <div className="stat-card">
          <div className="label">Новые заявки</div>
          <div className="value">{stats.newBookings}</div>
        </div>
      </div>

      <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
        <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: '12px' }}>Быстрый старт</h3>
        <ul style={{ color: '#6B6B6B', fontSize: '0.9rem', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <li>Перейдите в <strong>Категории</strong>, чтобы добавить или изменить разделы меню</li>
          <li>Перейдите в <strong>Позиции</strong>, чтобы управлять блюдами — загрузить фото, цену, описание</li>
          <li>Раздел <strong>Обратная связь</strong> покажет все сообщения от посетителей</li>
        </ul>
      </div>
    </div>
  );
}
