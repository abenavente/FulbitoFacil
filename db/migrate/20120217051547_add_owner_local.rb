class AddOwnerLocal < ActiveRecord::Migration
    def change
	alter_table :locals do |t|
	t.references :owner
	end
	add_index :locals, :owner_id
  end
end
