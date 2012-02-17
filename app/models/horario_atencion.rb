class HorarioAtencion < ActiveRecord::Base
  belongs_to :cancha
  belongs_to :dia_semana
end
