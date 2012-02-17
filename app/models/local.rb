class Local < ActiveRecord::Base
acts_as_gmappable
  belongs_to :district
  validates_presence_of :name, :address, :district_id, :phone
  validates_uniqueness_of :name
  validates :phone, :numericality => { :only_integer => true }


def gmaps4rails_address
  #address.to_s+" "+district.name.to_s
  "#{address},#{district.name.to_s}, Lima, Peru" 
end
end
