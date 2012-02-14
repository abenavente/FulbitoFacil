class AddDistrictToCustomer < ActiveRecord::Migration
  def change
	alter_table :customers do |t|
	t.references :district
	end
	add_index :customers, :district_id
  end
end
