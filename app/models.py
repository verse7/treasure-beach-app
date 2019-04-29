import datetime
from . import db
from werkzeug.security import generate_password_hash
        
class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    firstname = db.Column(db.String(255), nullable=False)
    lastname = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    location = db.Column(db.String(255), nullable=False)
    biography = db.Column(db.String(255), nullable=False)
    profile_photo = db.Column(db.String(255), nullable=False)
    joined_on = db.Column(db.Date, nullable=False, default=datetime.datetime.now())
    
    def __init__(self, username, password, firstname, lastname, email, 
                location, biography, profile_photo):
                    
                self.username = username
                self.password = generate_password_hash(password, method='pbkdf2:sha256')
                self.firstname = firstname
                self.lastname = lastname
                self.email = email
                self.location = location
                self.biography = biography
                self.profile_photo = profile_photo