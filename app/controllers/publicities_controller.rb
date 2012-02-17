class PublicitiesController < ApplicationController
  # GET /publicities
  # GET /publicities.json
  def index
  @search = Sportsfield.search(params[:search])
    @publicities = Publicity.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @publicities }
    end
  end

  # GET /publicities/1
  # GET /publicities/1.json
  def show
    @publicity = Publicity.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @publicity }
    end
  end
  


  # GET /publicities/new
  # GET /publicities/new.json
  def new
    @publicity = Publicity.new
    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @publicity }
    end
  end

  # GET /publicities/1/edit
  def edit
    @publicity = Publicity.find(params[:id])
  end

  # POST /publicities
  # POST /publicities.json
  def create
    @publicity = Publicity.new(params[:publicity])

    respond_to do |format|
      if @publicity.save
        format.html { redirect_to @publicity, notice: 'Publicity was successfully created.' }
        format.json { render json: @publicity, status: :created, location: @publicity }
      else
        format.html { render action: "new" }
        format.json { render json: @publicity.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /publicities/1
  # PUT /publicities/1.json
  def update
    @publicity = Publicity.find(params[:id])

    respond_to do |format|
      if @publicity.update_attributes(params[:publicity])
        format.html { redirect_to @publicity, notice: 'Publicity was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @publicity.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /publicities/1
  # DELETE /publicities/1.json
  def destroy
    @publicity = Publicity.find(params[:id])
    @publicity.destroy

    respond_to do |format|
      format.html { redirect_to publicities_url }
      format.json { head :no_content }
    end
  end
end
