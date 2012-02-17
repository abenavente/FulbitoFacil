class CreateCanchita < ActiveRecord::Migration
  def change
    create_table :canchita do |t|
      t.string :name
      t.references :local
      t.text :caracteristicas
      t.has_attached_file :foto

      t.timestamps
    end
    add_index :canchita, :local_id
  end
end
