class CreateHorarioAtencions < ActiveRecord::Migration
  def change
    create_table :horario_atencions do |t|
      t.references :cancha
      t.references :dia_semana
      t.time :start_time
      t.time :end_time

      t.timestamps
    end
    add_index :horario_atencions, :cancha_id
    add_index :horario_atencions, :dia_semana_id
  end
end
