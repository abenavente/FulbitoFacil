class CreateCanchas < ActiveRecord::Migration
  def change
    create_table :canchas do |t|
      t.string :name
      t.references :local
      t.text :caracteristicas

      t.timestamps
    end
    add_index :canchas, :local_id
  end
end
