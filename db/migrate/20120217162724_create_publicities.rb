class CreatePublicities < ActiveRecord::Migration
  def change
    create_table :publicities do |t|
      t.string :titulo
      t.string :contenido
      t.date :fechaInicio
      t.date :fechaFin
      t.decimal :tarifa
      t.integer :nroclick
      t.references :ubications

      t.timestamps
    end
    add_index :publicities, :ubications_id
  end
end
