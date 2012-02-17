class CreateTarifas < ActiveRecord::Migration
  def change
    create_table :tarifas do |t|
      t.references :cancha
      t.boolean :promocion
      t.references :dia_semana
      t.time :start_time
      t.time :end_time
      t.integer :price

      t.timestamps
    end
    add_index :tarifas, :cancha_id
    add_index :tarifas, :dia_semana_id
  end
end
