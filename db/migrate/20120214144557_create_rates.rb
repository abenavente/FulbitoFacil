class CreateRates < ActiveRecord::Migration
  def change
    create_table :rates do |t|
      t.time :start_time
      t.time :end_time
      t.integer :price
      t.boolean :promocio
      t.date :start_date
      t.date :end_date
      t.boolean :monday
      t.boolean :tuesday
      t.boolean :wednesday
      t.boolean :thursday
      t.boolean :friday
      t.boolean :saturday
      t.boolean :sunday

      t.timestamps
    end
  end
end
