from . import db

class Account(db.Model):
    __tablename__ = 'accounts'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    credits = db.Column(db.Integer, nullable=False, default=150)

    plan = db.Column(db.String(20), nullable=False, default='free')