class Owner < ActiveRecord::Base
  belongs_to :genere
  belongs_to :identity_card_type
  validates_presence_of :name, :lastname, :genere_id, :identity_card_type_id, :number_identity_card, :email, :password, :birthday
  validates_uniqueness_of :email
  validates :number_identity_card, :numericality => { :only_integer => true }
  validate :validation_password
  validate :validation_email

	
def validation_password		
errors.add(:password_confirmation, "Las contrasenas introducidas no coinciden. Vuelve a intentarlo.") if(password_confirmation!=password)				end
end
def validation_email		
errors.add(:email_confirmation, "Las direcciones de correo electronico introducidas no coinciden. Vuelve a intentarlo.") if(password_confirmation!=password)			
end

