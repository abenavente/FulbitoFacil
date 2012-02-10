class Customer < ActiveRecord::Base
  belongs_to :genere
  belongs_to :identity_card_type
  belongs_to :distrito
  
  validates_presence_of :name, :lastname, :email, :password  	
  validates_uniqueness_of :email
  
  
  


  attr_accessor :password
  before_save :encrypt_password
  
  validates_confirmation_of :password
  validates_presence_of :password, :on => :create
  
  def encrypt_password
    if password.present?
      self.password = BCrypt::Engine.generate_salt
      self.password_confirmation = BCrypt::Engine.hash_secret(password, password)
    end
  end

  def self.authenticate(email, password)
    customer = find_by_email(email)
    if customer #&& customer.password == BCrypt::Engine.hash_secret(password, password)
      customer
    else
      nil
    end
  end

  		

end
