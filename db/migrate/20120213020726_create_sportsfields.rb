class CreateSportsfields < ActiveRecord::Migration
  def change
    create_table :sportsfields do |t|
      t.string :name
      t.string :local
      t.text :feature
      t.boolean :monday
      t.boolean :tuesday
      t.boolean :wednesday
      t.boolean :thursday
      t.boolean :friday
      t.boolean :saturday
      t.boolean :sunday
      t.time :mon_time_start
      t.time :mon_time_end
      t.time :tue_time_start
      t.time :tue_time_end
      t.time :wed_time_start
      t.time :wed_time_end
      t.time :thu_time_start
      t.time :thu_time_end
      t.time :fri_time_start
      t.time :fri_time_end
      t.time :sat_time_start
      t.time :sat_time_end
      t.time :sun_time_start
      t.time :sun_time_end
      t.string :imagen

      t.timestamps
    end
  end
end
