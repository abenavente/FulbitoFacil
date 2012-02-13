class SportsfieldsController < ApplicationController
  # GET /sportsfields
  # GET /sportsfields.json
  def index
    @sportsfields = Sportsfield.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @sportsfields }
    end
  end

  # GET /sportsfields/1
  # GET /sportsfields/1.json
  def show
    @sportsfield = Sportsfield.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @sportsfield }
    end
  end

  # GET /sportsfields/new
  # GET /sportsfields/new.json
  def new
    @sportsfield = Sportsfield.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @sportsfield }
    end
  end

  # GET /sportsfields/1/edit
  def edit
    @sportsfield = Sportsfield.find(params[:id])
  end

  # POST /sportsfields
  # POST /sportsfields.json
  def create
    @sportsfield = Sportsfield.new(params[:sportsfield])

    respond_to do |format|
      if @sportsfield.save
        format.html { redirect_to @sportsfield, notice: 'Sportsfield was successfully created.' }
        format.json { render json: @sportsfield, status: :created, location: @sportsfield }
      else
        format.html { render action: "new" }
        format.json { render json: @sportsfield.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /sportsfields/1
  # PUT /sportsfields/1.json
  def update
    @sportsfield = Sportsfield.find(params[:id])

    respond_to do |format|
      if @sportsfield.update_attributes(params[:sportsfield])
        format.html { redirect_to @sportsfield, notice: 'Sportsfield was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @sportsfield.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /sportsfields/1
  # DELETE /sportsfields/1.json
  def destroy
    @sportsfield = Sportsfield.find(params[:id])
    @sportsfield.destroy

    respond_to do |format|
      format.html { redirect_to sportsfields_url }
      format.json { head :no_content }
    end
  end
end
