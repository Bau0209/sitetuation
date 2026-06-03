from . import db
from datetime import datetime

class Favorites(db.Model):
    __tablename__ = 'favorites'

    id = db.Column(db.Integer, primary_key=True)
    saved_date = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    address = db.Column(db.String(255), nullable=False)

    city_population = db.Column(db.String(100), nullable=False)
    barangay_population = db.Column(db.String(100), nullable=False)

    foot_traffic = db.Column(db.String(100))

    nearby_establishment = db.Column(db.JSON, nullable=False)
    competitors = db.Column(db.JSON, nullable=False)

    criminal_index = db.Column(db.Float())
    flood_rate = db.Column(db.Float())
    earthquake_rate = db.Column(db.Float())
    tsunami_rate = db.Column(db.Float())

    ai_summary = db.Column(db.Text)

    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)

    account = db.relationship('Account', backref='favorites')