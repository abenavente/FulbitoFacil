class Alquiler < ActiveRecord::Base
  belongs_to :cancha
  belongs_to :customer
  belongs_to :dia_semana
end
