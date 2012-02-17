class UbicationsController < ApplicationController
  # GET /ubications
  # GET /ubications.json
  def index
    @ubications = Ubication.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @ubications }
    end
  end

  # GET /ubications/1
  # GET /ubications/1.json
  def show
    @ubication = Ubication.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @ubication }
    end
  end

  # GET /ubications/new
  # GET /ubications/new.json
  def new
    @ubication = Ubication.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @ubication }
    end
  end

  # GET /ubications/1/edit
  def edit
    @ubication = Ubication.find(params[:id])
  end

  # POST /ubications
  # POST /ubications.json
  def create
    @ubication = Ubication.new(params[:ubication])

    respond_to do |format|
      if @ubication.save
        format.html { redirect_to @ubication, notice: 'Ubication was successfully created.' }
        format.json { render json: @ubication, status: :created, location: @ubication }
      else
        format.html { render action: "new" }
        format.json { render json: @ubication.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /ubications/1
  # PUT /ubications/1.json
  def update
    @ubication = Ubication.find(params[:id])

    respond_to do |format|
      if @ubication.update_attributes(params[:ubication])
        format.html { redirect_to @ubication, notice: 'Ubication was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @ubication.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /ubications/1
  # DELETE /ubications/1.json
  def destroy
    @ubication = Ubication.find(params[:id])
    @ubication.destroy

    respond_to do |format|
      format.html { redirect_to ubications_url }
      format.json { head :no_content }
    end
  end
end
