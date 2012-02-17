class Local < ActiveRecord::Base
  belongs_to :district
  belongs_to :sportsfield
  belongs_to :owner
  validates_presence_of :name, :address, :district_id, :google_maps_address, :phone
  validates_uniqueness_of :name
  validates :phone, :numericality => { :only_integer => true }
end
