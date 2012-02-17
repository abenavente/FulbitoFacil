class AddLocalToSportsfields < ActiveRecord::Migration
   def change
	alter_table :sportsfields do |t|
	t.references :local
	end
	add_index :sportsfields, :local_id
  end
end