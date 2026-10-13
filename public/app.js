/* RJN PRINT PORTAL — customer dashboard */
.app-content {
  width: min(1450px, 100%);
  margin: auto;
  padding: 24px clamp(14px, 3vw, 42px) 48px;
  color: #202033;
}

#nav {
  background: #fff;
  color: #202033;
  border-bottom: 1px solid #e9e4f2;
  box-shadow: 0 3px 14px rgba(34, 20, 70, .05);
}

.app-hero {
  border-radius: 18px;
  background: linear-gradient(115deg, #193f9e, #6338bd 58%, #dc477d);
  box-shadow: 0 10px 28px rgba(67, 48, 130, .13);
}

.app-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.app-grid .app-card,
.service-list-card {
  background: #fff;
  border: 1px solid #ece7f3;
  border-radius: 15px;
  box-shadow: 0 5px 18px rgba(49, 32, 76, .055);
}

.service-list-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 14px;
}

.service-list-card {
  min-width: 0;
  padding: 17px 15px;
  transition: transform .18s ease, box-shadow .18s ease;
}

.service-list-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(49, 32, 76, .11);
}

.service-list-card img {
  width: 54px;
  height: 54px;
  object-fit: contain;
}

.service-list-card p {
  color: #77758a;
  font-size: 12px;
  line-height: 1.45;
}

.service-list-card .app-button {
  width: 100%;
}

@media (max-width: 1050px) {
  .service-list-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 600px) {
  .app-content {
    padding: 14px 12px 30px;
  }

  .service-list-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }

  .service-list-card {
    padding: 14px 12px;
  }

  .service-list-card img {
    width: 46px;
    height: 46px;
  }
}
