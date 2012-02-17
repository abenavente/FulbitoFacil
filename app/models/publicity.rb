class Publicity < ActiveRecord::Base
has_attached_file :imagen, :styles => { :small => "150x150>"},
				   :url => "/assets/publicities/:id/:style/:basename.extension",
				   :path => ":rails_root/public//assets/publicities/:id/:style/:basename.extension"

validates_attachment_presence :imagen
validates_attachment_size :imagen, :less_than => 5.megabytes  				   
validates_attachment_content_type :imagen, :content_type => ['image/jpg', 'image/png'] 				   
belongs_to :local
validates_presence_of :name, :local, :feature

  belongs_to :ubications
end
