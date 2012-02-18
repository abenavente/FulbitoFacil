class CreateAlquilers < ActiveRecord::Migration
  def change
    create_table :alquilers do |t|
      t.references :cancha
      t.references :customer
      t.references :dia_semana
      t.time :star_time
      t.time :end_time

      t.timestamps
    end
    add_index :alquilers, :cancha_id
    add_index :alquilers, :customer_id
    add_index :alquilers, :dia_semana_id
  end
end
