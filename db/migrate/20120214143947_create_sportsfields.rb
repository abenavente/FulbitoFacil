class CreateSportsfields < ActiveRecord::Migration
  def change
    create_table :sportsfields do |t|
      t.string :name
        t.references :local
      t.text :feature
      t.boolean :monday
      t.boolean :tuesday
      t.boolean :wednesday
      t.boolean :thursday
      t.boolean :friday
      t.boolean :saturday
      t.boolean :sunday
      t.time :mon_start_time
      t.time :mon_end_time
      t.time :tue_start_time
      t.time :tue_end_time
      t.time :wed_start_time
      t.time :wed_end_time
      t.time :thu_start_time
      t.time :thu_end_time
      t.time :fri_start_time
      t.time :fri_end_time
      t.time :sat_start_time
      t.time :sat_end_time
      t.time :sun_start_time
      t.time :sun_end_start
      t.string :imagen

      t.timestamps
    end
	 add_index :sportsfields, :local_id
  end
end
