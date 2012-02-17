class AddColumnGoogleMapsLocals < ActiveRecord::Migration
  def change
	remove_column :locals, :google_maps_address
	add_column :locals, :latitude, :float #you can change the name, see wiki
	add_column :locals, :longitude, :float #you can change the name, see wiki
	add_column :locals, :gmaps, :boolean #not mandatory, see wiki
  end
end
