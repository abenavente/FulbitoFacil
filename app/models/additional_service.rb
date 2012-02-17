class AdditionalService < ActiveRecord::Base
  belongs_to :service_type
  validates_presence_of :service_type_id, :description, :tarifa

end
