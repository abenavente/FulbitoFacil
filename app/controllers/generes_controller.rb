class GeneresController < ApplicationController
  # GET /generes
  # GET /generes.json
  def index
    @generes = Genere.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render json: @generes }
    end
  end

  # GET /generes/1
  # GET /generes/1.json
  def show
    @genere = Genere.find(params[:id])

    respond_to do |format|
      format.html # show.html.erb
      format.json { render json: @genere }
    end
  end

  # GET /generes/new
  # GET /generes/new.json
  def new
    @genere = Genere.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render json: @genere }
    end
  end

  # GET /generes/1/edit
  def edit
    @genere = Genere.find(params[:id])
  end

  # POST /generes
  # POST /generes.json
  def create
    @genere = Genere.new(params[:genere])

    respond_to do |format|
      if @genere.save
        format.html { redirect_to @genere, notice: 'Genere was successfully created.' }
        format.json { render json: @genere, status: :created, location: @genere }
      else
        format.html { render action: "new" }
        format.json { render json: @genere.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /generes/1
  # PUT /generes/1.json
  def update
    @genere = Genere.find(params[:id])

    respond_to do |format|
      if @genere.update_attributes(params[:genere])
        format.html { redirect_to @genere, notice: 'Genere was successfully updated.' }
        format.json { head :no_content }
      else
        format.html { render action: "edit" }
        format.json { render json: @genere.errors, status: :unprocessable_entity }
      end
    end
  end

  # DELETE /generes/1
  # DELETE /generes/1.json
  def destroy
    @genere = Genere.find(params[:id])
    @genere.destroy

    respond_to do |format|
      format.html { redirect_to generes_url }
      format.json { head :no_content }
    end
  end
end
