class Tarifa < ActiveRecord::Base
  belongs_to :cancha
  belongs_to :dia_semana
end
