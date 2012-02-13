class CreateLocals < ActiveRecord::Migration
  def change
    create_table :locals do |t|
      t.string :name
      t.string :address
      t.references :district
      t.text :google_maps_address
      t.string :phone

      t.timestamps
    end
    add_index :locals, :district_id
  end
end
