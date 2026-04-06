import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { getCategories, getItems, sendFeedback, sendBooking } from '../api';

export default function MenuPage() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [lang, setLang] = useState('ru');
  const sectionRefs = useRef({});

  // Feedback form
  const [fb, setFb] = useState({ name: '', phone: '', message: '' });
  const [fbSent, setFbSent] = useState(false);
  const [fbLoading, setFbLoading] = useState(false);

  // Booking modal
  const [showBooking, setShowBooking] = useState(false);
  const [booking, setBooking] = useState({ name: '', phone: '', date: '', guests: '', eventType: '', hall: '', message: '' });
  const [bookingSent, setBookingSent] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    Promise.all([getCategories(), getItems()]).then(([cats, itms]) => {
      setCategories(cats);
      setItems(itms);
      if (cats.length > 0) setActiveCategory(cats[0].id);
    });
  }, []);

  const scrollToCategory = (catId) => {
    setActiveCategory(catId);
    const el = sectionRefs.current[catId];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const t = (item, field) => {
    if (lang === 'ru' && item[field + '_ru']) return item[field + '_ru'];
    return item[field];
  };

  const handleFeedback = async (e) => {
    e.preventDefault();
    setFbLoading(true);
    try {
      await sendFeedback(fb);
      setFbSent(true);
      setFb({ name: '', phone: '', message: '' });
    } catch { /* ignore */ }
    setFbLoading(false);
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    setBookingLoading(true);
    try {
      await sendBooking(booking);
      setBookingSent(true);
      setBooking({ name: '', phone: '', date: '', guests: '', eventType: '', hall: '', message: '' });
    } catch { /* ignore */ }
    setBookingLoading(false);
  };

  // Group items by category
  const grouped = categories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category_id === cat.id),
  }));

  return (
    <div className="menu-page">
      {/* Hero */}
      <header className="hero">
        <div className="lang-toggle">
          <button className={`lang-btn ${lang === 'ro' ? 'active' : ''}`} onClick={() => setLang('ro')}>RO</button>
          <button className={`lang-btn ${lang === 'ru' ? 'active' : ''}`} onClick={() => setLang('ru')}>RU</button>
        </div>
        <div className="hero-ornament">&#10043; &#10043; &#10043;</div>
        <h1>OSCAR</h1>
        <p className="hero-subtitle">Restaurant &amp; Banquet Hall</p>
        <div className="hero-info">
          <span>Bălți, Moldova</span>
          <span>(+373) 612 22 888</span>
        </div>
      </header>

      {/* Booking banner */}
      <div className="booking-banner">
        <div className="booking-banner-inner">
          <div className="booking-banner-text">
            <span className="booking-banner-icon">&#127878;</span>
            <div>
              <strong>{lang === 'ru' ? 'Банкетные залы' : 'Săli de banchet'}</strong>
              <span>{lang === 'ru' ? 'Свадьбы, кумэтрии, юбилеи, корпоративы' : 'Nunți, cumetrii, aniversări, corporate'}</span>
            </div>
          </div>
          <div className="booking-banner-buttons">
            <Link to="/banquet" className="btn-booking btn-booking-outline">
              {lang === 'ru' ? 'Банкетное меню' : 'Menu banchet'}
            </Link>
            <button className="btn-booking" onClick={() => { setShowBooking(true); setBookingSent(false); }}>
              {lang === 'ru' ? 'Забронировать' : 'Rezervă'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && (
        <div className="modal-overlay" onClick={() => setShowBooking(false)}>
          <div className="modal booking-modal" onClick={e => e.stopPropagation()}>
            <h2>{lang === 'ru' ? 'Бронирование зала' : 'Rezervarea sălii'}</h2>
            <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', marginBottom: '20px' }}>
              {lang === 'ru' ? 'Оставьте заявку и мы свяжемся с вами' : 'Lăsați o cerere și vă vom contacta'}
            </p>
            {bookingSent ? (
              <div className="feedback-success">
                {lang === 'ru' ? 'Спасибо! Мы свяжемся с вами для подтверждения брони.' : 'Mulțumim! Vă vom contacta pentru confirmare.'}
              </div>
            ) : (
              <form className="modal-form" onSubmit={handleBooking}>
                <div className="form-row">
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Имя *' : 'Numele *'}</label>
                    <input className="form-input" value={booking.name} onChange={e => setBooking({ ...booking, name: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Телефон *' : 'Telefon *'}</label>
                    <input className="form-input" type="tel" value={booking.phone} onChange={e => setBooking({ ...booking, phone: e.target.value })} required />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Дата мероприятия *' : 'Data evenimentului *'}</label>
                    <input className="form-input" type="date" value={booking.date} onChange={e => setBooking({ ...booking, date: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Кол-во гостей' : 'Număr de invitați'}</label>
                    <input className="form-input" type="number" min="1" value={booking.guests} onChange={e => setBooking({ ...booking, guests: e.target.value })} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Тип мероприятия' : 'Tipul evenimentului'}</label>
                    <select className="form-input" value={booking.eventType} onChange={e => setBooking({ ...booking, eventType: e.target.value })}>
                      <option value="">{lang === 'ru' ? 'Выберите...' : 'Selectați...'}</option>
                      <option value="wedding">{lang === 'ru' ? 'Свадьба' : 'Nuntă'}</option>
                      <option value="cumetrie">{lang === 'ru' ? 'Кумэтрия' : 'Cumetrie'}</option>
                      <option value="birthday">{lang === 'ru' ? 'День рождения / Юбилей' : 'Zi de naștere / Aniversare'}</option>
                      <option value="corporate">{lang === 'ru' ? 'Корпоратив / Конференция' : 'Corporate / Conferință'}</option>
                      <option value="banquet">{lang === 'ru' ? 'Банкет' : 'Banchet'}</option>
                      <option value="other">{lang === 'ru' ? 'Другое' : 'Altele'}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{lang === 'ru' ? 'Зал' : 'Sala'}</label>
                    <select className="form-input" value={booking.hall} onChange={e => setBooking({ ...booking, hall: e.target.value })}>
                      <option value="">{lang === 'ru' ? 'Выберите зал...' : 'Selectați sala...'}</option>
                      <option value="sala1">{lang === 'ru' ? 'Зал 1 (до 30 гостей)' : 'Sala 1 (până la 30 invitați)'}</option>
                      <option value="sala2">{lang === 'ru' ? 'Зал 2 (до 60 гостей)' : 'Sala 2 (până la 60 invitați)'}</option>
                      <option value="sala3">{lang === 'ru' ? 'Зал 3 (до 120 гостей)' : 'Sala 3 (până la 120 invitați)'}</option>
                      <option value="vip">{lang === 'ru' ? 'VIP зал (до 15 гостей)' : 'Sala VIP (până la 15 invitați)'}</option>
                      <option value="restaurant">{lang === 'ru' ? 'Ресторан à la carte' : 'Restaurant à la carte'}</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>{lang === 'ru' ? 'Пожелания' : 'Dorințe'}</label>
                  <textarea className="form-textarea" style={{ minHeight: '60px' }} value={booking.message} onChange={e => setBooking({ ...booking, message: e.target.value })} />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={() => setShowBooking(false)}>{lang === 'ru' ? 'Отмена' : 'Anulare'}</button>
                  <button type="submit" className="btn-primary" disabled={bookingLoading}>
                    {bookingLoading ? (lang === 'ru' ? 'Отправка...' : 'Se trimite...') : (lang === 'ru' ? 'Отправить заявку' : 'Trimite cererea')}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Category tabs */}
      {categories.length > 0 && (
        <nav className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`cat-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => scrollToCategory(cat.id)}
            >
              {t(cat, 'name')}
            </button>
          ))}
        </nav>
      )}

      {/* Menu sections */}
      <main className="menu-content">
        {grouped.map(cat => (
          <section
            key={cat.id}
            className="menu-section"
            ref={el => (sectionRefs.current[cat.id] = el)}
          >
            <div className="section-header">
              <h2>{t(cat, 'name')}</h2>
              <div className="section-line" />
            </div>
            <div className="menu-items-grid">
              {cat.items.filter(i => i.available).map(item => (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-image-wrap">
                    <div className="ratio-3-4">
                      {item.image ? (
                        <img src={`/uploads/${item.image}`} alt={t(item, 'name')} loading="lazy" />
                      ) : (
                        <div className="placeholder-icon">&#9827;</div>
                      )}
                    </div>
                  </div>
                  <div className="menu-item-info">
                    <div className="menu-item-top">
                      <span className="menu-item-name">{t(item, 'name')}</span>
                      <span className="menu-item-price">{item.price} MDL</span>
                    </div>
                    {(t(item, 'description')) && (
                      <p className="menu-item-desc">{t(item, 'description')}</p>
                    )}
                    {item.weight && (
                      <p className="menu-item-weight">{item.weight}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {cat.items.filter(i => i.available).length === 0 && (
              <div className="empty-state">
                <p>{lang === 'ru' ? 'Скоро здесь появятся блюда' : 'În curând vor apărea preparate'}</p>
              </div>
            )}
          </section>
        ))}
      </main>

      {/* Feedback */}
      <section className="feedback-section" id="feedback">
        <h2>{lang === 'ru' ? 'Свяжитесь с нами' : 'Contactați-ne'}</h2>
        <p>{lang === 'ru' ? 'Оставьте отзыв или забронируйте столик' : 'Lăsați un feedback sau rezervați o masă'}</p>

        {fbSent ? (
          <div className="feedback-success">
            {lang === 'ru' ? 'Спасибо! Мы свяжемся с вами в ближайшее время.' : 'Mulțumim! Vă vom contacta în curând.'}
          </div>
        ) : (
          <form className="feedback-form" onSubmit={handleFeedback}>
            <div className="feedback-row">
              <input
                className="form-input"
                placeholder={lang === 'ru' ? 'Ваше имя *' : 'Numele dvs. *'}
                value={fb.name}
                onChange={e => setFb({ ...fb, name: e.target.value })}
                required
              />
              <input
                className="form-input"
                placeholder={lang === 'ru' ? 'Телефон' : 'Telefon'}
                value={fb.phone}
                onChange={e => setFb({ ...fb, phone: e.target.value })}
              />
            </div>
            <textarea
              className="form-textarea"
              placeholder={lang === 'ru' ? 'Ваше сообщение *' : 'Mesajul dvs. *'}
              value={fb.message}
              onChange={e => setFb({ ...fb, message: e.target.value })}
              required
            />
            <button className="btn-primary" type="submit" disabled={fbLoading}>
              {fbLoading
                ? (lang === 'ru' ? 'Отправка...' : 'Se trimite...')
                : (lang === 'ru' ? 'Отправить' : 'Trimite')}
            </button>
          </form>
        )}
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-name">OSCAR</div>
        <div className="footer-info">
          <span>Bălți, Moldova</span>
          <a href="tel:+37361222888">(+373) 612 22 888</a>
          <a href="mailto:oscar@restaurantebalti.md">oscar@restaurantebalti.md</a>
        </div>
        <div className="footer-social">
          <a href="https://www.facebook.com/RestaurantOscarBalti/" target="_blank" rel="noopener">Facebook</a>
        </div>
        <p className="footer-copy">&copy; 2024 Restaurant OSCAR. {lang === 'ru' ? 'Все права защищены.' : 'Toate drepturile rezervate.'}</p>
      </footer>

      {/* WhatsApp Widget */}
      <a
        href="https://wa.me/37361222888"
        className="whatsapp-widget"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <svg viewBox="0 0 32 32" width="28" height="28" fill="white">
          <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16.004c0 3.5 1.132 6.742 3.054 9.378L1.056 31.2l6.04-1.94A15.91 15.91 0 0016.004 32C24.826 32 32 24.826 32 16.004 32 7.176 24.826 0 16.004 0zm9.318 22.594c-.39 1.1-1.932 2.014-3.168 2.28-.844.18-1.946.322-5.656-1.216-4.746-1.968-7.8-6.79-8.036-7.104-.226-.314-1.9-2.53-1.9-4.828s1.2-3.426 1.628-3.894c.428-.47.936-.586 1.248-.586.312 0 .624.002.898.016.288.014.674-.11 1.054.804.39.938 1.326 3.236 1.442 3.47.116.234.194.506.038.82-.156.312-.234.508-.468.782-.234.274-.492.612-.702.82-.234.234-.478.488-.206.958.274.468 1.216 2.006 2.61 3.252 1.792 1.6 3.302 2.096 3.77 2.33.468.234.742.194 1.016-.116.274-.312 1.17-1.366 1.482-1.836.312-.468.624-.39 1.054-.234.43.156 2.728 1.288 3.196 1.522.468.234.78.352.898.546.116.196.116 1.124-.274 2.224z"/>
        </svg>
      </a>
    </div>
  );
}
