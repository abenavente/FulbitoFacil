class Canchitum < ActiveRecord::Base
  belongs_to :local
  has_attached_file :foto, :styles => { :medium => "300x300>", :thumb => "100x100>" }
end
