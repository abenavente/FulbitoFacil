class Customer < ActiveRecord::Base
  belongs_to :genere
  belongs_to :identity_card_type
  belongs_to :distrito
end
